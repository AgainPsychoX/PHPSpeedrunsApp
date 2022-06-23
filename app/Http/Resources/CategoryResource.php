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
			// Entry
			'id' => $this->id,
			'gameId' => $this->game_id,
			'name' => $this->name,

			// Details
			'rules' => $this->rules,
			'scoreRule' => $this->score_rule,
			'verificationRequirement' => $this->verification_requirement,
			'createdAt' => $this->created_at,
			'updatedAt' => $this->updated_at,

			'runs' => RunResource::collection($this->whenLoaded('runs')),
			'moderators' => $this->when($this->loadModerators == 'direct', fn() => ModeratorEntryResource::collection($this->moderators(true)->get(['users.id', 'users.name', 'users.email', 'target_type as scope']))),
		];
	}
}
