<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
	use PasswordValidationRules;
	use UsernameValidationRules;

	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array<string, mixed>
	 */
	public function rules()
	{
		// Note: password and e-mail can be empty, for ghost accounts.
		return [
			'name' => $this->usernameRules(),
			'email' => 'required_with:password|prohibited:password|string|email|max:255|unique:users,email',
			'password' => array_merge(['sometimes', 'nullable'], $this->passwordRules()),
			'countryId' => 'sometimes|nullable|string|size:3',
			'youtubeUrl' => [ 'sometimes', 'nullable', 'string', 'regex:/^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)$/i' ],
			'twitchUrl'  => [ 'sometimes', 'nullable', 'string', 'regex:/^https?:\/\/(www\.)?twitch\.tv\/[\w-]+)$/i '],
			'twitterUrl' => [ 'sometimes', 'nullable', 'string', 'regex:/^https:\/\/twitter.com\/([a-zA-Z0-9_]+)\/?$/i' ],
			'discord' => 'sometimes|nullable|string|regex:/^.{3,32}#[0-9]{4}$/',
			'profileDescription' => 'sometimes|nullable|string|max:4000',
		];
	}
}
