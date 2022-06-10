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
            'game_id' => $this->game_id,
            'name' => $this->name,
            'rules' => $this->rules,
            'icon' => $this->iconUrl(),
            'score_rule' => $this->score_rule,
            //'created_at' => $this->created_at,
            //'updated_at' => $this->updated_at,
            'runs' => RunResource::collection($this->whenLoaded('runs')),
        ];
    }
}
