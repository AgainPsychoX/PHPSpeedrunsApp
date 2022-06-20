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
			'gameId' => 'sometimes|required_with:name|exists:games,id',
			'name' => 'sometimes|required_with:game_id|string|between:3,64|unique_two:categories,name,game_id,' . $this->game_id,
			'rules' => 'sometimes|nullable|string|max:4000',
			'scoreRule' => [ 'sometimes', 'required', Rule::in(['none', 'high', 'low']) ],
			'verificationRequirement' => 'sometimes|required|integer|between:1,10',
		];
	}
}
