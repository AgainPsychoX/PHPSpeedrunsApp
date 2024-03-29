<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Http\Resources\GameCollection;
use App\Models\Game;

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

		$orderBy = $queryParams['order_by'] ?? 'popular';
		$direction = $queryParams['direction'] ?? null;
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
				->orderBy('runs_count', $direction ?: 'desc')
			;
			return GameResource::collection($gamesQuery->paginate(16, ['games.id', 'name', 'publish_year', 'icon', 'runs_count']));
		}

		// Alphanumeric
		if (str_starts_with($orderBy, 'al')) {
			return GameResource::collection(
				Game::orderBy('name', $direction ?: 'asc')
					->paginate(16, ['id', 'name', 'publish_year', 'icon'])
			);
		}

		// Publish year
		if (str_starts_with($orderBy, 'y') || str_starts_with($orderBy, 'p')) {
			return GameResource::collection(
				Game::orderBy('publish_year', $direction ?: 'desc')
					->paginate(16, ['id', 'name', 'publish_year', 'icon'])
			);
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
				->orderBy('latest_run_at', $direction ?: 'desc')
			;
			return GameResource::collection($gamesQuery->paginate(16, ['games.id', 'name', 'publish_year', 'icon', 'latest_run_at']));
		}

		return response()->json([
			"message" => "Invalid 'orderBy' parameter. Valid values are: (empty), 'popularity', 'alphanumeric', 'year', 'activity'. Either 'desc' or 'asc' can be also specified as separate parameter.",
		], 400);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function show(Game $game)
	{
		$game = $game->loadMissing([
			'categories' => function($query) {
				$query->withCount('runs')->orderBy('runs_count', 'DESC');
			}
		]);
		$game->loadModerators = 'direct';
		return new GameResource($game);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreGameRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreGameRequest $request)
	{
		Gate::authorize('create', Game::class);

		if ($request->hasFile('iconFile')) {
			$ext = strtolower($request->iconFile->extension());
			if ($ext == 'jpg') $ext = 'jpeg';
		}
		else {
			$ext = 'none';
		}
		$request->merge([ 'icon' => $ext ]);

		$game = Game::create($request->all());

		if ($ext != 'none') {
			Storage::putFileAs("public/images/games/$game->id", $request->iconFile, "icon.$ext", 'public');
		}

		return $this->show($game);
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
		Gate::authorize('update', $game);

		if ($request->hasFile('iconFile')) {
			$ext = strtolower($request->iconFile->extension());
			if ($ext == 'jpg') $ext = 'jpeg';
			$request->merge([ 'icon' => $ext ]);
		}
		else {
			if (boolval($request->remove_icon)) {
				$oldExt = $game->icon;
				$ext = 'none';
				$request->merge([ 'icon' => $ext ]);
			}
		}

		$game->update($request->all());
		$game = $game->refresh();

		if (isset($ext)) {
			if ($ext == 'none') {
				Storage::delete("public/images/games/$game->id/icon.$oldExt");
			}
			else {
				Storage::putFileAs("public/images/games/$game->id", $request->iconFile, "icon.$ext", 'public');
			}
		}

		return $this->show($game);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Game $game)
	{
		Gate::authorize('delete', $game);

		$count = $game->categories()->count();
		if ($count > 0) {
			return response()->json([
				"message" => "There are categories associated with this game. You need either delete or move those first.",
				"count" => $count,
			], 409);
		}

		Storage::deleteDirectory("public/images/games/$game->id/");
		$game->delete();
		return response()->noContent();
	}
}
