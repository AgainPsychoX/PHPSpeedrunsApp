<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategoryCollection;
use App\Models\Category;

class CategoryController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		// TODO: maybe it should be implemented? like for querying empty categories or something...
		return response()->json([
			"message" => "Not implemented (as not required). Query for game to get related categories.",
		], 501);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function show(Category $category)
	{
		$scoreRule = $category->score_rule;
		$category = $category->loadMissing([
			'runs' => function ($query) use($scoreRule) {
				if ($scoreRule != 'none') {
					$query = $query->orderBy('score', $scoreRule == 'low' ? 'ASC' : 'DESC');
				}
				$query = $query->orderBy('duration', 'DESC');
			}
		]);
		$category->loadModerators = 'direct';
		return new CategoryResource($category);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreCategoryRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreCategoryRequest $request)
	{
		Gate::authorize('create');

		return $this->show(Category::create([
			'game_id' => $request->gameId,
			'name' => $request->name,
			'rules' => $request->rules ?? '',
			'score_rule' => $request->gameId ?? 'none',
			'verification_requirement' => $request->verificationRequirement ?? 1,
		]));
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \App\Http\Requests\UpdateCategoryRequest  $request
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function update(UpdateCategoryRequest $request, Category $category)
	{
		Gate::authorize('update', $category);

		if ($category->verification_requirement != $request->verification_requirement) {
			// TODO: update all related runs
		}

		$category->update([
			'game_id' => $request->gameId,
			'name' => $request->name,
			'rules' => $request->rules,
			'score_rule' => $request->gameId,
			'verification_requirement' => $request->verificationRequirement,
		]);
		$category = $category->refresh();
		return $this->show($category);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Category $category)
	{
		Gate::authorize('delete', $category);

		$count = $category->runs()->count();
		if ($count == 0) {
			$category->delete();
			return response()->noContent();
		}
		else {
			return response()->json([
				"message" => "There are runs associated with this category. You need either delete or move those first.",
				"count" => $count,
			], 409);
		}
	}
}
