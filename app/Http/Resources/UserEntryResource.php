<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserEntryResource extends JsonResource
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
			'id' => $this->id,
			'name' => $this->name,
			'email' => $this->when($user && ($user->id == $this->id || $user->isAnyModerator()), $this->email),
		];
	}
}
