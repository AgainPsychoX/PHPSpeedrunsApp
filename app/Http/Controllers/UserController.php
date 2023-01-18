<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserEntryResource;
use App\Http\Resources\UserSummaryResource;
use App\Http\Resources\UserDetailsResource;
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

		$orderBy = $queryParams['order_by'] ?? 'latestRun';
		$direction = $queryParams['direction'] ?? null;
		if (array_key_exists('asc', $queryParams)) $direction = 'asc';
		else if (array_key_exists('desc', $queryParams)) $direction = 'desc';

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
			$query = User::query()
				->leftJoinSub($runsCountsQuery, 'a', fn ($join) => $join->on('users.id', '=', 'a.user_id'))
				->leftJoinSub($latestRunsQuery, 'b', fn ($join) => $join->on('users.id', '=', 'b.user_id'))
				->leftJoin('categories', 'latest_run_category_id', '=', 'categories.id')
				->leftJoin('games', 'categories.game_id', '=', 'games.id')
				->select(
					'users.*',
					DB::raw('(case when `runs_count` is null then 0 else `runs_count` end) as `runs_count`'),
					'latest_run_at',
					'latest_run_id',
					'latest_run_category_id',
					'categories.name as latest_run_category_name',
					'games.id as latest_run_game_id',
					'games.name as latest_run_game_name',
				)
			;
			$query->orderBy('latest_run_at', $direction ?: 'desc');

			$queryParams['minimum_runs'] ??= 1;
		}
		// Other, less composite ordering
		else {
			$query = User::withCount('runs');

			// Alphanumeric
			if (str_starts_with($orderBy, 'a')) {
				$query->orderBy('name', $direction ?: 'asc');
			}
			// Runs count
			else if (str_starts_with($orderBy, 'r')) {
				$query->orderBy('runs_count', $direction ?: 'desc');
			}
			// Joined date
			else if (str_starts_with($orderBy, 'j')) {
				$query->orderBy('created_at', $direction ?: 'desc');
			}
			// Invalid
			else {
				return response()->json([
					"message" => "Invalid 'orderBy' parameter. Valid values are: (empty), 'alphanumeric', 'joined', 'latestRun', 'runsCount'. Either 'desc' or 'asc' can be also specified as separate parameter.",
				], 400);
			}
		}

		$search = $queryParams['search'] ?? null;
		$ghosts = $queryParams['ghosts'] ?? 'any';
		$minimumRuns = intval($queryParams['minimum_runs'] ?? 0);

		if ($search) $query->where('users.name', 'like', "%$search%")->orWhere('users.email', 'like', "%$search%");
		if ($ghosts == 'exclude') $query->ghosts(false); else if ($ghosts == 'only') $query->ghosts();
		if ($minimumRuns > 0) $query->having('runs_count', '>=', $minimumRuns);

		return UserSummaryResource::collection($query->paginate(40));
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function show(User $user)
	{
		$user->showIsAdmin = true;
		return new UserDetailsResource($user->loadCount('runs'));
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreUserRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreUserRequest $request)
	{
		return $this->show(User::create($request->all()));
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
		return $this->show($user);
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
