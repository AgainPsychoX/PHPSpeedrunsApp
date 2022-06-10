<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

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
            'publish_year' => $this->publish_year,
            //'created_at' => $this->created_at,
            //'updated_at' => $this->updated_at,
            'categories' => CategoryResource::collection($this->whenLoaded('trips')),
        ];
    }
}
