<?php

namespace App\Providers;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
	/**
	 * The model to policy mappings for the application.
	 *
	 * @var array<class-string, class-string>
	 */
	protected $policies = [
		// 'App\Models\Model' => 'App\Policies\ModelPolicy',
	];

	/**
	 * Register any authentication / authorization services.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->registerPolicies();

		Gate::define('add-global-moderator', fn (User $user) =>
			$user->isGlobalModerator()
				? Response::allow()
				: Response::deny('You must be an global moderator yourself first.')
		);
		Gate::define('remove-global-moderator', fn (User $user) =>
			$user->isGlobalModerator()
				? Response::allow()
				: Response::deny('You must be an global moderator yourself first.')
		);
	}
}
