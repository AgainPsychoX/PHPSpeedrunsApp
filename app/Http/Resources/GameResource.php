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
			'id' => $this->id,
			'name' => $this->name,
			'description' => $this->description,
			'rules' => $this->rules,
			'icon' => $this->iconUrl(),
			'publishYear' => $this->publish_year,
			'createdAt' => $this->created_at,
			'updatedAt' => $this->updated_at,
			'categories' => CategoryResource::collection($this->whenLoaded('categories')),
			'runsCount' => $this->whenNotNull($this->runs_count),
			'latestRunAt' => is_null($this->latest_run_at)
				? new MissingValue
				: Carbon::parse($this->latest_run_at)->toISOString(),
		];
	}
}
