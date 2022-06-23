<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CategoryPolicy
{
	use HandlesAuthorization;

	/**
	 * Determine whether the user can create models.
	 *
	 * @param  \App\Models\User  $user
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function create(User $user)
	{
		return $user->isGameModerator($category->game_id);
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
	 * @param  \App\Models\Category  $category
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function addModerator(Category $category, Game $game)
	{
		return $user->isGameModerator($category->game_id);
	}

	/**
	 * Determine whether the user remove moderators for the category.
	 *
	 * @param  \App\Models\Category  $category
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function removeModerator(Category $category, Game $game)
	{
		return $user->isGameModerator($category->game_id);
	}
}