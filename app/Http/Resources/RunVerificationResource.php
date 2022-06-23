<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RunVerificationResource extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
	 */
	public function toArray($request)
	{
		$user = $request->user();
		return [
			'runId' => $this->run_id,
			'userId' => $this->user_id,
			'moderator' => $this->when(!is_null($this->target_type), fn () => ModeratorEntryResource::make($this)),
			'vote' => $this->vote,
			'note' => $this->note ?? '',
			'timestamp' => $this->timestamp,
		];
	}
}
