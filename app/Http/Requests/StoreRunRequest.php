<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRunRequest extends FormRequest
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
            'category_id'   => 'required|exists:categories,id',
            'user_id'       => 'required|exists:categories,id',
            'duration'      => 'required|integer|min:100', // ms
            'score'         => 'required|integer',
            'video_url'     => 'required|url',
            'notes'         => 'string|between:20,4000',
        ];
        // TODO: validate video, better regex or even full validation by curl request
    }
}
