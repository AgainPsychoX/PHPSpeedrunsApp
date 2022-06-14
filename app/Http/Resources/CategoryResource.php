<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
			'gameId' => $this->game_id,
			'name' => $this->name,
			'rules' => $this->rules,
			'scoreRule' => $this->score_rule,
			'createdAt' => $this->created_at,
			'updatedAt' => $this->updated_at,
			'runs' => RunResource::collection($this->whenLoaded('runs')),
		];
	}
}
