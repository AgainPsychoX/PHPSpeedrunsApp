<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGameRequest extends FormRequest
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
			'name'          => 'sometimes|required|string|between:3,64|unique:games,name',
			'description'   => 'sometimes|nullable|string|max:4000',
			'rules'         => 'sometimes|nullable|string|max:4000',
			'icon'          => 'sometimes|file|dimensions:min_width=100,min_height=100,max_width=800,max_height=800|mimes:jpeg,png,webp',
			'publishYear'   => 'sometimes|required|integer|between:1970,2200',
		];
	}
}
