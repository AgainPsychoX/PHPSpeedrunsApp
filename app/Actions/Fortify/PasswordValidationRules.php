<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Rules\Password;

trait PasswordValidationRules
{
	/**
	 * Get the validation rules used to validate passwords.
	 *
	 * @return array
	 */
	protected function passwordRules()
	{
		return [
			'required',
			'string',
			new class extends Password {
				protected $requireUppercase = true;
				protected $requireNumeric = true;
				protected $requireSpecialCharacter = true;
			},
			// 'confirmed' // 'repeatPassword' used instead of `password_confirmed`
		];
	}
}
