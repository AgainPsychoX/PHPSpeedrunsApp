<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRunRequest extends FormRequest
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
			'category_id'   => 'sometimes|required|exists:categories,id',
			'user_id'       => 'sometimes|required|exists:categories,id',
			'duration'      => 'sometimes|required|integer|min:100', // ms
			'score'         => 'sometimes|required|integer',
			'video_url'     => 'sometimes|required|url',
			'notes'         => 'sometimes|nullable|string|max:4000',
		];
	}
}
