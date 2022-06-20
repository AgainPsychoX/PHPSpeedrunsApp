<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'game_id'       => 'sometimes|required_with:name|exists:games,id',
            'name'          => 'sometimes|required_with:game_id|string|between:3,64|unique_two:categories,name,game_id,' . $this->game_id,
            'rules'         => 'sometimes|nullable|string|max:4000',
            'icon'          => 'sometimes|file|dimensions:min_width=100,min_height=100,max_width=800,max_height=800|mimes:jpeg,png,webp',
            'score_rule'    => [ 'sometimes', 'required', Rule::in(['none', 'high', 'low']) ],
        ];
    }
}
