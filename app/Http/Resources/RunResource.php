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
			'id' => $this->id,

			'categoryId' => $this->category_id,
			'categoryName' => $this->whenLoaded('category', fn () => $this->category->name),

			'gameId' => $this->whenLoaded('category', fn () => $this->category->game_id),
			'gameName' => $this->when(
				$this->relationLoaded('category') && $this->category->relationLoaded('game'),
				fn () => $this->game->name,
			),

			'userId' => $this->user_id,
			'userName' => $this->whenLoaded('user', fn () => $this->user->name),

			'duration' => $this->duration,
			'score' => $this->score,
			'videoUrl' => $this->video_url,
			'notes' => $this->notes,
			'state' => $this->state,
			'createdAt' => $this->created_at,
			'updatedAt' => $this->updated_at,
		];
	}
}
