<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;
use Illuminate\Support\Carbon;

class UserResource extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
	 */
	public function toArray($request)
	{
		return [
			'id' => $this->id,
			'name' => $this->name,
			'email' => $this->email,
			'isGhost' => $this->isGhost(),
			'country_id' => $this->country_id,
			'youtube_url' => $this->youtube_url,
			'twitch_url' => $this->twitch_url,
			'twitter_url' => $this->twitter_url,
			'discord' => $this->discord,
			'profileDescription' => $this->profile_description,
		];
	}
}
