<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Http\Resources\GameCollection;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		$queryParams = $request->query();
		$orderBy = $queryParams['orderBy'] ?? 'popular';
		$direction = null;
		if (array_key_exists('asc', $queryParams)) $direction = 'asc';
		else if (array_key_exists('desc', $queryParams)) $direction = 'desc';

		// Popularity (default)
		if (str_starts_with($orderBy, 'popular')) {
			$runCountsQuery = Game::query()
				->leftJoin('categories', 'games.id', '=', 'categories.game_id')
				->leftJoin('runs', 'categories.id', '=', 'runs.category_id')
				->select('games.id', DB::raw('count(`runs`.`id`) as `runs_count`'))
				->groupBy('games.id')
			;
			$gamesQuery = Game::query()
				->joinSub($runCountsQuery, 'i_hate_php', fn ($join) => $join->on('games.id', '=', 'i_hate_php.id'))
				->with('categories')
				->orderBy('runs_count', $direction ?: 'desc')
			;
			return GameResource::collection($gamesQuery->paginate(16));
		}

		// Alphanumeric
		if (str_starts_with($orderBy, 'al')) {
			return GameResource::collection(Game::with('categories')->orderBy('name', $direction ?: 'asc')->paginate(16));
		}

		// Publish year
		if (str_starts_with($orderBy, 'y') || str_starts_with($orderBy, 'p')) {
			return GameResource::collection(Game::with('categories')->orderBy('publish_year', $direction ?: 'desc')->paginate(16));
		}

		// Last activity
		if (str_starts_with($orderBy, 'ac')) {
			$runActivityQuery = Game::query()
				->leftJoin('categories', 'games.id', '=', 'categories.game_id')
				->leftJoin('runs', 'categories.id', '=', 'runs.category_id')
				->select('games.id', DB::raw('max(`runs`.`created_at`) as `latest_run_at`'))
				->groupBy('games.id')
			;
			$gamesQuery = Game::query()
				->joinSub($runActivityQuery, 'i_hate_php', fn ($join) => $join->on('games.id', '=', 'i_hate_php.id'))
				->with('categories')
				->orderBy('latest_run_at', $direction ?: 'desc')
			;
			return GameResource::collection($gamesQuery->paginate(16));
		}

		return response()->json([
			"message" => "Invalid 'orderBy' parameter. Valid values are: (empty), 'popularity', 'alphanumeric', 'year', 'activity'. Either 'desc' or 'asc' can be also specified as separate parameter.",
		], 400);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreGameRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreGameRequest $request)
	{
		return new GameResource(Game::create($request->all()));
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function show(Game $game)
	{
		return new GameResource($game->loadMissing([
			'categories' => function($query) {
				$query->withCount('runs')->orderBy('runs_count', 'DESC');
			}
		]));
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \App\Http\Requests\UpdateGameRequest  $request
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function update(UpdateGameRequest $request, Game $game)
	{
		$game->update($request->all());
		$game = $game->refresh();
		return new GameResource($game);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Game $game)
	{
		$count = $game->categories()->count();
		if ($count == 0) {
			$game->delete();
			return response()->noContent();
		}
		else {
			return response()->json([
				"message" => "There are categories associated with this game. You need either delete or move those first.",
				"count" => $count,
			], 409);
		}
	}
}
