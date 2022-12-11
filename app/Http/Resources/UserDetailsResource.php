<?php

namespace App\Http\Resources;

class UserDetailsResource extends UserSummaryResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
	 */
	public function toArray($request)
	{
		return array_merge(parent::toArray($request), [
			'youtubeUrl' => $this->youtube_url,
			'twitchUrl' => $this->twitch_url,
			'twitterUrl' => $this->twitter_url,
			'discord' => $this->discord,
			'profileDescription' => $this->profile_description ?? "",
		]);
	}
}
