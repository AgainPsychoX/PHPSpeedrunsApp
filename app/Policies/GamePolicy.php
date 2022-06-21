<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GamePolicy
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
		return $user->isGlobalModerator();
	}

	/**
	 * Determine whether the user can update the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function update(User $user, Game $game)
	{
		return $user->isGameModerator($game);
	}

	/**
	 * Determine whether the user can delete the model.
	 *
	 * @param  \App\Models\User  $user
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Auth\Access\Response|bool
	 */
	public function delete(User $user, Game $game)
	{
		return $user->isGlobalModerator($game);
	}
}
