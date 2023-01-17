<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategoryCollection;
use App\Models\Game;
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
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Category  $category
	 * @return \Illuminate\Http\Response
	 */
	public function show(Request $request, Category $category)
	{
		$currentUser = $request->user();
		if ($currentUser) {
			$currentUserId = $currentUser->id;
			$isModerator = $currentUser->isCategoryModerator($category);
		}
		else {
			$currentUserId = 0;
			$isModerator = false;
		}
		$scoreRule = $category->score_rule;
		$category = $category->loadMissing([
			'runs' => function ($query) use($scoreRule, $isModerator, $currentUserId) {
				// Unless moderator or owner, list only verified runs
				if (env('SHOW_UNVERIFIED_RUNS_TO_ALL', false) || !$isModerator) {
					$query = $query->where(fn ($query) =>
						$query->where('state', 'verified')->orWhere('user_id', $currentUserId)
					);
				}
				// Sorting according to the category score rule
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
	 * @param  \App\Models\Game  $game
	 * @return \Illuminate\Http\Response
	 */
	public function store(StoreCategoryRequest $request, Game $game)
	{
		Gate::authorize('create', [Category::class, $game]);

		return $this->show($request, Category::create($request->all()));
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

		if ($request->filled('category_id') && $category->id != $request->category_id && !$user->isGlobalModerator()) {
			return response()->json([
				"message" => "You need to be global moderator to move categories between games.",
			], 403);
		}

		if ($category->verification_requirement != $request->verification_requirement) {
			// TODO: update all related runs
		}

		$category->update($request->all());
		$category = $category->refresh();
		return $this->show($request, $category);
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
