<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

use App\Http\Resources\RunVerificationResource;
use App\Models\User;
use App\Models\Run;
use App\Models\RunVerification;
use App\Models\ModeratorAssignment;

class RunVerificationController extends Controller
{
	private function updateRunState(Run $run) {
		$results = RunVerification::votesForRun($run);
		$required = $run->category->verification_requirement;

		$state = 'pending';
		$delta = $results->yes_count - $results->no_count;
		if ($delta >= $required) $state = 'verified';
		else if ($results->no_count > 1) $state = 'invalid';

		$run->update(['state' => $state]);
	}

	/**
	 * Response with list of moderators who voted about given run verification.
	 *
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function index(Run $run)
	{
		$query = RunVerification::forRunWithModerators($run)->orderBy('timestamp');
		return RunVerificationResource::collection($query->get());
	}

	/**
	 * Sets vote from current moderator about given run verification.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Http\Response
	 */
	public function vote(Request $request, Run $run)
	{
		Gate::authorize('vote', $run);

		if (!in_array($request->vote, ['yes', 'no', 'abstain'])) {
			return response()->json([
				"message" => "'vote' should be 'yes', 'no' or 'abstain'.",
			], 400);
		}

		$verifier = $request->user();
		$data = [
			'run_id' => $run->id,
			'user_id' => $verifier->id,
			'vote' => $request->vote,
			'note' => $request->note ?? '',
			'timestamp' => Carbon::now()->toDateTimeString(),
		];

		// TODO: 3 requests XD
		$instance = RunVerification::where('run_id', $run->id)->where('user_id', $verifier->id)->first();
		if ($instance) {
			RunVerification::where('run_id', $run->id)->where('user_id', $verifier->id)->update($data);
			$instance = RunVerification::where('run_id', $run->id)->where('user_id', $verifier->id)->first();
		}
		else {
			$instance = RunVerification::create($data);
		}

		$this->updateRunState($run);

		// Saturate
		$instance->id = $verifier->id;
		$instance->name = $verifier->name;
		//$instance->email = $verifier->email;
		$instance->target_type = ModeratorAssignment::where('moderator_assignments.user_id', $verifier->id)
			->category($run->category_id)
			->joinWidestScopePerUser()
			->select(['moderator_assignments.user_id', 'widest_target_type as target_type', 'target_id'])
			->first()->target_type
		;

		return RunVerificationResource::make($instance);
	}
}
