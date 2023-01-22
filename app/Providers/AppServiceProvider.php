<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
	/**
	 * Register any application services.
	 *
	 * @return void
	 */
	public function register()
	{
		//
	}

	/**
	 * Bootstrap any application services.
	 *
	 * @return void
	 */
	public function boot()
	{
		Model::preventLazyLoading(!app()->isProduction());

		Relation::enforceMorphMap([
			'game' => 'App\Models\Game',
			'category' => 'App\Models\Category',
		]);

		// Adapted from https://stackoverflow.com/a/36575300/4880243
		Validator::extend('unique_two', function ($attribute, $value, $parameters) {
			// Get the parameters passed to the rule
			list($table, $field, $field2, $field2Value) = $parameters;

			// Check the table and return true only if there are no entries matching
			// both the first field name and the user input value as well as
			// the second field name and the second field value
			return DB::table($table)->where($field, $value)->where($field2, $field2Value)->count() == 0;
		});

		ResetPassword::createUrlUsing(function ($notifiable, $token) {
			return route('react', ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()]);
		});
	}
}
