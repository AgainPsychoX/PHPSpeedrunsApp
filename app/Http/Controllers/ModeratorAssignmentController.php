<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

use App\Http\Resources\ModeratorSummaryResource;
use App\Models\User;
use App\Models\Game;
use App\Models\Category;
use App\Models\ModeratorAssignment;

class ModeratorAssignmentController extends Controller
{
	const moderatorSummaryFields = [
		'users.id as id', 'users.name', 'email', 'created_at',
		'target_type', 'target_id',
		'assigned_by', 'assigned_by_user.name as assigned_by_name', 'assigned_at'
	];

	private function saturateIntoModeratorSummary($instance, User $user, User $assignedBy) {
		$instance->id = $user->id;
		$instance->name = $user->name;
		$instance->email = $user->email;
		$instance->created_at = $user->created_at;

		$instance->assigned_at = Carbon::now();
		$instance->assigned_by_name = $assignedBy->name;

		return $instance;
	}

	////////////////////////////////////////////////////////////////////////////////
	// Global moderators

	/**
	 * Response with global moderators summaries.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function globalIndex()
	{
		$query = ModeratorAssignment::active()->global()->joinUser()->joinAssignedBy()
			->orderBy('users.name')
			->select(ModeratorAssignmentController::moderatorSummaryFields);
		return ModeratorSummaryResource::collection($query->get());
	}

	/**
	 * Add global moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function globalAdd(Request $request, User $user)
	{
		Gate::authorize('add-global-moderator');
		$assigner = $request->user();

		if ($user->isGhost()) {
			return response()->json([
				"message" => "Ghost users cannot be assigned moderator roles.",
			], 406);
		}
		if ($user->isGlobalModerator()) {
			return response()->json([
				"message" => "This user already is a global moderator.",
			], 409);
		}

		$instance = ModeratorAssignment::create([
			'user_id' => $user->id,
			'target_type' => 'global',
			//'target_id' => null,
			'assigned_by' => $assigner->id,
			//'assigned_at' => Carbon::now()->toDateTimeString(), // Auto-generated in database anyway
		]);
		return ModeratorSummaryResource::make(
			$this->saturateIntoModeratorSummary($instance, $user, $assigner));
	}

	/**
	 * Remove global moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function globalRemove(Request $request, User $user)
	{
		// Why would someone want to remove themselves?
		// ⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠙⠿⠛⠉⠁⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		// ⣿⣿⣿⡿⠁⠀⢠⠤⠖⠒⠒⠲⢬⣇⣀⠤⠠⢄⣀⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		// ⣿⣿⡯⠁⠀⠀⠀⣠⣴⡶⠖⠲⠾⣢⡠⣴⡲⠶⠶⣶⣝⢿⣿⣿⣿⣿⣿⣿⣿
		// ⡿⠋⠀⠀⠀⠀⢞⣛⠋⠁⠀⠀⠀⠀⠀⡧⠀⠀⠀⠀⠀⠀⡀⣿⣿⣿⣿⣿⣿⣿
		// ⠁⠀⠀⠀⠀⠀⠀⢹⡿⢶⣶⣶⣶⣶⣾⠿⠷⢶⡶⠶⠶⠟⣿⣿⣿⣿⣿⣿⣿⣿
		// ⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⢠⠴⠞⠋⠀⠐⠲⠼⣷⠖⠲⣿⣿⣿⣿⣿⣿⣿⣿⣿
		// ⠀⠀⠀⠀⠀⠀⣠⠾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⢻⣿⣿⡿⢃⢰⡍⠝⣿
		// ⠀⠀⠀⠀⠀⠐⣵⣖⣓⡲⠦⣤⣤⣄⣀⣀⣀⣀⣀⣨⡥⢆⣏⢨⠻⡘⣆⣷⡸⣸
		// ⠀⠀⠀⠀⠐⢄⡈⠉⠉⠉⠙⠒⢂⡄⡀⠀⡄⠶⠶⠶⣂⡿⢻⢸⣷⣾⣿⢟⣵⣿
		// ⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀  ⢦⡀⢸⣤⣇⢠⡇⢰⠐⣿⡟⢰⣿⣿⠟⣫⣾⣿⣿⣿
		// ⣿⣿⣿⣶⣶⣤⣤⣄⣀⣀⣀⣙⠻⢿⢿⣿⠖⢫⣾⣿⣷⢸⣿⣿⡇⣿⣿⣿⣿⣿
		// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⡆⣿⣦⡙⢿⣿⣏⣿⣿⣷⠻⣿⣿⣿⣿
		// ⣿⣿⣿⣿⣎⠻⣿⣿⣿⣿⣿⡇⣿⣿⣿⢁⣿⣿⣿⣦⡙⣿⢻⣿⣿⡇⢿⣿⣿⣿
		// ⡝⣿⣿⣿⣿⣷⣜⢿⣿⣿⡿⢰⣿⣿⣿⢘⢿⣿⣿⣿⣿⢀⣿⣿⣿⡇⣾⣿⣿⣿
		// ⣿⡌⢿⣿⣿⣿⣿⣧⡙⢿⢣⣿⣿⣿⡏⣼⣧⣌⠻⢿⢣⣿⣿⣿⣿⢇⣿⣿⣿⣿
		// They are forced to use PHP, that's why...

		Gate::authorize('remove-global-moderator');

		$affected = ModeratorAssignment::active()->global()->where('user_id', $user->id)->update([
			'revoked_by' => $request->user()->id,
			'revoked_at' => Carbon::now()->toDateTimeString(),
		]);
		return response()->json([
			"message" => $affected == 0
				? "This user already is not a moderator for this category."
				: "This user is no longer a moderator for this category.",
			"affected" => $affected,
		]);
	}

	////////////////////////////////////////////////////////////////////////////////
	// Game moderators

	/**
	 * Response with game moderators summaries.
	 *
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function gameIndex(Game $game)
	{
		$query = ModeratorAssignment::active()->game($game)->joinUser()->joinAssignedBy()
			->orderByScope()->orderBy('users.name')
			->select(ModeratorAssignmentController::moderatorSummaryFields);
		return ModeratorSummaryResource::collection($query->get());
	}

	/**
	 * Add game moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Game  $game
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function gameAdd(Request $request, Game $game, User $user)
	{
		Gate::authorize('add-moderator', $game);
		$assigner = $request->user();

		if ($user->isGhost()) {
			return response()->json([
				"message" => "Ghost users cannot be assigned moderator roles.",
			], 406);
		}
		if ($user->isGameModerator($game)) {
			return response()->json([
				"message" => "This user already is a moderator for this game.",
			], 409);
		}

		$instance = ModeratorAssignment::create([
			'user_id' => $user->id,
			'target_type' => 'game',
			'target_id' => $game->id,
			'assigned_by' => $assigner->id,
			//'assigned_at' => Carbon::now()->toDateTimeString(), // Auto-generated in database anyway
		]);
		return ModeratorSummaryResource::make(
			$this->saturateIntoModeratorSummary($instance, $user, $assigner));
	}

	/**
	 * Remove user from being game moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Game  $game
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function gameRemove(Request $request, Game $game, User $user)
	{
		Gate::authorize('remove-moderator', $game);

		$affected = ModeratorAssignment::active()->game($game)->where('user_id', $user->id)->update([
			'revoked_by' => $request->user()->id,
			'revoked_at' => Carbon::now()->toDateTimeString(),
		]);
		return response()->json([
			"message" => $affected == 0
				? "This user already is not a moderator for this game."
				: "This user is no longer a moderator for this game.",
			"affected" => $affected,
		]);
	}


	////////////////////////////////////////////////////////////////////////////////
	// Category moderators

	/**
	 * Response with category moderators summaries.
	 *
	 * @param  \App\Models\Category $category
	 * @return \Illuminate\Http\Response
	 */
	public function categoryIndex(Category $category)
	{
		$query = ModeratorAssignment::active()->category($category)->joinUser()->joinAssignedBy()
			->orderByScope()->orderBy('users.name')
			->select(ModeratorAssignmentController::moderatorSummaryFields);
		return ModeratorSummaryResource::collection($query->get());
	}

	/**
	 * Add category moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Category $category
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function categoryAdd(Request $request, Category $category, User $user)
	{
		Gate::authorize('add-moderator', $category);
		$assigner = $request->user();

		if ($user->isGhost()) {
			return response()->json([
				"message" => "Ghost users cannot be assigned moderator roles.",
			], 406);
		}
		if ($user->isGameModerator($category->game_id)) {
			return response()->json([
				"message" => "This user already is a moderator for this game.",
			], 409);
		}

		$instance = ModeratorAssignment::create([
			'user_id' => $user->id,
			'target_type' => 'category',
			'target_id' => $category->id,
			'assigned_by' => $request->user()->id,
			//'assigned_at' => Carbon::now()->toDateTimeString(), // Auto-generated in database anyway
		]);
		return ModeratorSummaryResource::make(
			$this->saturateIntoModeratorSummary($instance, $user, $assigner));
	}

	/**
	 * Remove user from being category moderator.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Category $category
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Http\Response
	 */
	public function categoryRemove(Request $request, Category $category, User $user)
	{
		Gate::authorize('remove-moderator', $category);

		$affected = ModeratorAssignment::active()->category($category)->where('user_id', $user->id)->update([
			'revoked_by' => $request->user()->id,
			'revoked_at' => Carbon::now()->toDateTimeString(),
		]);
		return response()->json([
			"message" => $affected == 0
				? "This user already is not a moderator for this category."
				: "This user is no longer a moderator for this category.",
			"affected" => $affected,
		]);
	}
}
