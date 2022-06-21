<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;
use Illuminate\Support\Carbon;

class GameResource extends JsonResource
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
			// Entry
			'id' => $this->id,
			'name' => $this->name,
			'publishYear' => $this->publish_year,
			'icon' => $this->iconUrl(),

			// Summary
			'runsCount' => $this->whenNotNull($this->runs_count),
			'latestRunAt' => is_null($this->latest_run_at)
				? new MissingValue
				: Carbon::parse($this->latest_run_at)->toIso8601ZuluString(),

			// Details
			'rules' => $this->whenNotNull($this->rules),
			'description' => $this->whenNotNull($this->description),
			'createdAt' => $this->whenNotNull($this->created_at),
			'updatedAt' => $this->whenNotNull($this->updated_at),

			'categories' => CategoryResource::collection($this->whenLoaded('categories')),
			'moderators' => $this->when($this->loadModerators == 'direct', fn () => UserSummaryResource::collection($this->directModerators()->get())),
		];
	}
}
