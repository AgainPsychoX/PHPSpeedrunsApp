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
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreRunRequest $request)
	{
		Gate::authorize('create');

		$run = Run::create($request->all())->loadMissing('category');
		return new RunResource($run);
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

		$run->update($request->all());
		$run = $run->refresh()->loadMissing('category');
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
		Gate::authorize('delete', $run);

		$run->delete();
		return response()->noContent();
	}
}
