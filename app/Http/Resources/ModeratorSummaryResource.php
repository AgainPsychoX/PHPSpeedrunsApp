<?php

namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ModeratorSummaryResource extends JsonResource
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
			'id' => $this->user_id,
			'name' => $this->name,
			'email' => $this->email,
			'joinedAt' => $this->created_at,

			'scope' => $this->target_type,
			'targetId' => $this->target_id,

			'assignedAt' => $this->assigned_at,
			'assignedBy' => [
				'id' => $this->assigned_by,
				'name' => $this->assigned_by_name,
			],
		];
	}
}
