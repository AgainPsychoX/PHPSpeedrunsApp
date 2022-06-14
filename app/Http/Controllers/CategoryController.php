<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
		return CategoryResource::collection(Category::all());
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \App\Http\Requests\StoreCategoryRequest  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreCategoryRequest $request)
	{
		return new CategoryResource(Category::create($request->all()));
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
		return new CategoryResource($category->loadMissing([
			'runs' => function ($query) use($scoreRule) {
				if ($scoreRule != 'none') {
					$query = $query->orderBy('score', $scoreRule == 'low' ? 'ASC' : 'DESC');
				}
				$query = $query->orderBy('duration', 'DESC');
			}
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
		$category->update($request->all());
		$category = $category->refresh();
		return new CategoryResource($category);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Category $category)
	{
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
