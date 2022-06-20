<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
			'gameId' => 'required|exists:games,id',
			'name' => 'required|string|between:3,64|unique_two:categories,name,game_id,' . $this->game_id,
			'rules' => 'nullable|string|max:4000',
			'scoreRule' => [ 'required', Rule::in(['none', 'high', 'low']) ],
			'verificationRequirement' => 'required|integer|between:1,10',
		];
		// TODO: enforce icon aspect ratio, close to square
		// TODO: allow larger icon file, but scale down when saving
	}
}
