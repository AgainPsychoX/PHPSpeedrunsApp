<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
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
            'name'          => 'required|string|between:3,64|unique:games,name',
            'description'   => 'required|string|between:20,4000',
            'rules'         => 'required|string|between:20,4000',
            'icon'          => 'file|dimensions:min_width=100,min_height=100,max_width=800,max_height=800|mimes:jpeg,png,webp',
            'publish_year'  => 'required|integer|between:1970,2200',
        ];
        // TODO: enforce icon aspect ratio, close to square
        // TODO: allow larger icon file, but scale down when saving
        // TODO: enforce publish year to be lower or equal current year
    }
}
