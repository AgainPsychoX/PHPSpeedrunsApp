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
			'countryId' => $this->country_id,
			'youtubeUrl' => $this->youtube_url,
			'twitchUrl' => $this->twitch_url,
			'twitterUrl' => $this->twitter_url,
			'discord' => $this->discord,
			'profileDescription' => $this->profile_description,
			'runsCount' => $this->whenNotNull($this->runs_count),
			'latestRun' => $this->when(!is_null($this->latest_run_at), fn () => [
				'at' => is_null($this->latest_run_at)
					? new MissingValue
					: Carbon::parse($this->latest_run_at)->toIso8601ZuluString(),
				'id' => $this->latest_run_id,
				'categoryId'   => $this->whenNotNull($this->latest_run_category_id),
				'categoryName' => $this->whenNotNull($this->latest_run_category_name),
				'gameId'       => $this->whenNotNull($this->latest_run_game_id),
				'gameName'     => $this->whenNotNull($this->latest_run_game_name),
			]),
			'joinedAt' => $this->created_at,
		];
	}
}
