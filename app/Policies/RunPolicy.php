<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;
use App\Models\Run;
use Illuminate\Auth\Access\HandlesAuthorization;

class RunPolicy
{
	use HandlesAuthorization;

	/**
	 * Determine whether the user can create models.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function create(User $user, Category $category)
	{
		return true;
	}

	/**
	 * Determine whether the user can update the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function update(User $user, Run $run)
	{
		return $user->id === $run->user_id || $user->isCategoryModerator($run->category_id);
	}

	/**
	 * Determine whether the user can delete the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function delete(User $user, Run $run)
	{
		return $user->id === $run->user_id || $user->isCategoryModerator($run->category_id);
	}

	/**
	 * Determine whether the user can vote for the run verification.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Run  $run
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function vote(User $user, Run $run)
	{
		return $user->isCategoryModerator($run->category_id);
	}
}
