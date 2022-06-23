<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RunResource extends JsonResource
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

			'categoryId' => $this->category_id,
			'categoryName' => $this->category_name ?? $this->whenLoaded('category', fn () => $this->category->name),

			'gameId' => $this->game_id ?? $this->whenLoaded('category', fn () => $this->category->game_id),
			'gameName' => $this->whenNotNull($this->game_name),

			'userId' => $this->user_id,
			'userName' => $this->user_name ?? $this->whenLoaded('user', fn () => $this->user->name),

			'createdAt' => $this->created_at,

			// Summary
			'duration' => $this->duration,
			'score' => $this->score,
			'videoUrl' => $this->video_url,

			'state' => $this->state,

			// Run
			'notes' => $this->notes,
			'updatedAt' => $this->updated_at,
		];
	}
}
