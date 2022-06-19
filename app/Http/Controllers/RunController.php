<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests\StoreRunRequest;
use App\Http\Requests\UpdateRunRequest;
use App\Http\Resources\RunResource;
use App\Http\Resources\RunCollection;
use App\Models\Run;

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
			$orderBy = $queryParams['orderBy'] ?? 'latest';

			if (str_starts_with($orderBy, 'l')) {
				return RunResource::collection(
					Run::where('user_id', (int) $player)
						->with('category.game')
						->orderBy('created_at', $direction ?: 'desc')
						->paginate(40)
				);
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
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreRunRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreRunRequest $request)
	{
		return new RunResource(Run::create($request->all()));
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
	 * Update the specified resource in storage.
	 *
	 * @param  \App\Http\Requests\UpdateRunRequest  $request
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function update(UpdateRunRequest $request, Run $run)
	{
		$run->update($request->all());
		$run = $run->refresh();
		return new RunResource($run);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Run $run)
	{
		$count = $run->runs()->count();
		if ($count == 0) {
			$run->delete();
			return response()->noContent();
		}
		else {
			return response()->json([
				"message" => "There are runs associated with this Run. You need either delete or move those first.",
				"count" => $count,
			], 409);
		}
	}
}
