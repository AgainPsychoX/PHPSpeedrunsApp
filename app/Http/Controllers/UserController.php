<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Run;

class UserController extends Controller
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
		$orderBy = $queryParams['orderBy'] ?? 'latestRun';
		$direction = null;
		if (array_key_exists('asc', $queryParams)) $direction = 'asc';
		else if (array_key_exists('desc', $queryParams)) $direction = 'desc';
		$requiredRuns = array_key_exists('players', $queryParams) ? 1 : 0;

		// Latest run
		if (str_starts_with($orderBy, 'l')) {
			$runsCountsQuery = Run::query()
				->select('runs.user_id', DB::raw('count(`runs`.`id`) as `runs_count`'))
				->groupBy('runs.user_id')
			;
			$latestRunsQuery = Run::query()
				->select(
					'runs.user_id',
					DB::raw('max(`runs`.`created_at`) as `latest_run_at`'),
					'runs.id as latest_run_id',
					'runs.category_id as latest_run_category_id'
				)
				->groupBy('runs.user_id')
			;
			$usersQuery = User::query()
				->joinSub($runsCountsQuery, 'a', fn ($join) => $join->on('users.id', '=', 'a.user_id'))
				->joinSub($latestRunsQuery, 'b', fn ($join) => $join->on('users.id', '=', 'b.user_id'))
				->leftJoin('categories', 'latest_run_category_id', '=', 'categories.id')
				->leftJoin('games', 'categories.game_id', '=', 'games.id')
				->select(
					'users.*',
					'runs_count',
					'latest_run_at',
					'latest_run_id',
					'latest_run_category_id',
					'categories.name as latest_run_category_name',
					'games.id as latest_run_game_id',
					'games.name as latest_run_game_name',
				)
				// ->distinct()
				->orderBy('latest_run_at', $direction ?: 'desc')
			;
			return UserResource::collection($usersQuery->paginate(40));
		}

		// Alphanumeric
		if (str_starts_with($orderBy, 'a')) {
			return UserResource::collection(
				User::withCount('runs')
					->having('runs_count', '>=', $requiredRuns)
					->orderBy('name', $direction ?: 'asc')
					->paginate(40));
		}

		// Runs count
		if (str_starts_with($orderBy, 'r')) {
			return UserResource::collection(
				User::withCount('runs')
					->having('runs_count', '>=', $requiredRuns)
					->orderBy('runs_count', $direction ?: 'desc')
					->paginate(40)
			);
		}

		// Joined date
		if (str_starts_with($orderBy, 'j')) {
			return UserResource::collection(
				User::withCount('runs')
					->having('runs_count', '>=', $requiredRuns)
					->orderBy('created_at', $direction ?: 'desc')
					->paginate(40)
			);
		}

		return response()->json([
			"message" => "Invalid 'orderBy' parameter. Valid values are: (empty), 'alphanumeric', 'joined', 'latestRun', 'runsCount'. Either 'desc' or 'asc' can be also specified as separate parameter.",
		], 400);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreUserRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreUserRequest $request)
	{
		return new UserResource(User::create($request->all()));
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function show(User $user)
	{
		return new UserResource($user);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \App\Http\Requests\UpdateUserRequest  $request
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function update(UpdateUserRequest $request, User $user)
	{
		$user->update($request->all());
		$user = $user->refresh();
		return new UserResource($user);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(User $user)
	{
		$count = $user->runs()->count();
		if ($count == 0) {
			$user->delete();
			return response()->noContent();
		}
		else {
			return response()->json([
				"message" => "There are runs associated with this user. You need either delete or move those first.",
				"count" => $count,
			], 409);
		}
	}
}
