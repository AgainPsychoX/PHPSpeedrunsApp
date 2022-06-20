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
		// Note: password can be empty, for ghost accounts.
		// TODO: should email be optional too?
		return [
			'name' => $this->usernameRules(),
			'email' => 'required|string|email|max:255|unique:users,email',
			'password' => array_merge(['sometimes', $this->passwordRules()]),
			'country_id' => 'sometimes|nullable|string|size:3',
			'youtube_url' => [ 'sometimes', 'nullable', 'string', 'regex:/^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)$/i' ],
			'twitch_url'  => [ 'sometimes', 'nullable', 'string', 'regex:/^https?:\/\/(www\.)?twitch\.tv\/[\w-]+)$/i '],
			'twitter_url' => [ 'sometimes', 'nullable', 'string', 'regex:/^https:\/\/twitter.com\/([a-zA-Z0-9_]+)\/?$/i' ],
			'discord' => 'sometimes|nullable|string|regex:/^.{3,32}#[0-9]{4}$/',
			'profile_description' => 'sometimes|nullable|string|max:4000',
		];
	}
}
