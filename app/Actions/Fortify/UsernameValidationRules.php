<?php

namespace App\Actions\Fortify;

trait UsernameValidationRules
{
	/**
	 * Get the validation rules used to validate usernames.
	 *
	 * @return array
	 */
	protected function usernameRules()
	{
		return [
			'required',
			'string',
			'regex:/^[\w.]{3,40}$/',
			'unique:users,name',
		];
	}
}
