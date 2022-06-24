<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Game;
use App\Models\Category;
use Illuminate\Auth\Access\HandlesAuthorization;

class CategoryPolicy
{
	use HandlesAuthorization;

	/**
	 * Determine whether the user can create models.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function create(User $user, Game $game)
	{
		return $user->isGameModerator($game);
	}

	/**
	 * Determine whether the user can update the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function update(User $user, Category $category)
	{
		return $user->isCategoryModerator($category);
	}

	/**
	 * Determine whether the user can delete the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function delete(User $user, Category $category)
	{
		return $user->isGameModerator($category->game_id);
	}

	/**
	 * Determine whether the user add moderators for the category.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function addModerator(User $user, Category $category)
	{
		return $user->isGameModerator($category->game_id);
	}

	/**
	 * Determine whether the user remove moderators for the category.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function removeModerator(User $user, Category $category)
	{
		return $user->isGameModerator($category->game_id);
	}
}
