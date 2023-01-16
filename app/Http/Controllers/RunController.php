<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

use App\Http\Requests\StoreRunRequest;
use App\Http\Requests\UpdateRunRequest;
use App\Http\Resources\RunResource;
use App\Http\Resources\RunCollection;
use App\Models\Run;
use App\Models\Category;
use App\Models\Game;

class RunController extends Controller
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

		$direction = null;
		if (array_key_exists('asc', $queryParams)) $direction = 'asc';
		else if (array_key_exists('desc', $queryParams)) $direction = 'desc';

		if ($player = $queryParams['player'] ?? null) {
			$orderBy = $queryParams['order_by'] ?? 'latest';

			if (str_starts_with($orderBy, 'l')) {
				$query = Run::forUser((int) $player)
					->orderBy('created_at', $direction ?: 'desc');
				// dd($query->toSql());
				return RunResource::collection($query->paginate(40));
			}

			return response()->json([
				"message" => "Invalid 'orderBy' parameter. Valid values are: (empty), 'latest'. Either 'desc' or 'asc' can be also specified as separate parameter.",
			], 400);
		}

		if (array_key_exists('category', $queryParams)) {
			return response()->json([
				"message" => "Listing multiple run details not supported. Use category endpoint to fetch runs summaries, then, if necessary, query for run details",
			], 501);
		}

		if (array_key_exists('game', $queryParams)) {
			return response()->json([
				"message" => "Listing multiple run details not supported. Use game endpoint to fetch categories first, then fetch run summaries, then, if necessary, query for run details",
			], 501);
		}

		return response()->json([
			"message" => "Grouping parameter is required. Possible grouping parameters: 'player'.",
		], 400);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function show(Run $run)
	{
		return new RunResource($run->loadMissing('category.game'));
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreRunRequest  $request
	 * @param  \App\Models\Game  $game
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreRunRequest $request, Game $game, Category $category)
	{
		Gate::authorize('create', [Run::class, $category]);
		$user = $request->user();

		if ($request->filled('user_id') && $user->id != $request->user_id && !$user->isCategoryModerator($category)) {
			return response()->json([
				"message" => "You can't create runs as other player!",
			], 403);
		}

		return $this->show(Run::create($request->all()));
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \App\Http\Requests\UpdateRunRequest  $request
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function update(UpdateRunRequest $request, Run $run)
	{
		Gate::authorize('update', $run);
		$isCategoryModerator = $user->isCategoryModerator($category);

		if ($request->filled('user_id') && $user->id != $request->user_id && !$isCategoryModerator) {
			return response()->json([
				"message" => "You can't move runs to other player.",
			], 403);
		}

		if ($request->filled('category_id') && $category->id != $request->category_id && !$user->isGameModerator($game)) {
			return response()->json([
				"message" => "You need to be game moderator to move runs between categories.",
			], 403);
		}

		if ($run->state == 'verified' && $request->filledAny(array_diff(Run::getFillable(), ['notes'])) && !$isCategoryModerator) {
			return response()->json([
				"message" => "After run was verified, you can't edit anything, except notes.",
			], 403);
		}

		$run->update($request->all());
		$run = $run->refresh();
		return $this->show($run);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Run $run)
	{
		Gate::authorize('delete', $run);

		$run->delete();
		return response()->noContent();
	}
}
