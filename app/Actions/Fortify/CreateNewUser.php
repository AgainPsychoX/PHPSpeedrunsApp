<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
	use PasswordValidationRules;

	/**
	 * Validate and create a newly registered user.
	 *
	 * @param  array  $input
	 * @return \App\Models\User
	 */
	public function create(array $input)
	{
		Validator::make($input, [
			'name' => 'required|string|max:40',
			'email' => [ 'required', 'string', 'email', 'max:255', Rule::unique(User::class) ],
			'password' => $this->passwordRules(),
			'repeatPassword' => 'required|same:password',
			'countryId' => 'sometimes|required|string|size:3',
			'youtubeUrl' => [ 'sometimes', 'required', 'string', 'regex:/^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{21}[AQgw]|(c\/|user\/)?[\w-]+)$/i' ],
			'twitchUrl'  => [ 'sometimes', 'required', 'string', 'regex:/^https?:\/\/(www\.)?twitch\.tv\/[\w-]+)$/i '],
			'twitterUrl' => [ 'sometimes', 'required', 'string', 'regex:/^https:\/\/twitter.com\/([a-zA-Z0-9_]+)\/?$/i' ],
			'discord' => 'sometimes|required|string|regex:/^.{3,32}#[0-9]{4}$/',
			'profileDescription' => 'sometimes|required|string|max:4000',
			'agreement' => 'required',
		])->validate();

		return User::create([
			'name' => $input['name'],
			'email' => $input['email'],
			'password' => Hash::make($input['password']),
			'country_id' => $input['countryId'] ?? null,
			'youtube_url' => $input['youtubeUrl'] ?? null,
			'twitch_url' => $input['twitchUrl'] ?? null,
			'twitter_url' => $input['twitterUrl'] ?? null,
			'discord' => $input['discord'] ?? null,
			'profile_description' => $input['profileDescription'] ?? '',
		]);
	}
}
