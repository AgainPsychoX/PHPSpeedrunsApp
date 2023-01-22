<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RunController;
use App\Http\Controllers\ModeratorAssignmentController;
use App\Http\Controllers\RunVerificationController;
use App\Http\Resources\UserDetailsResource;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->group(function () {
	Route::get('/user', function (Request $request) {
		$user = $request->user();
		$user->showRole = true;
		return new UserDetailsResource($user->loadCount('runs'));
	});
});
Route::middleware('auth')->group(function () {
	Route::get('/moderator', function (Request $request) {
		// TODO: return limited amount of oldest moderation pending stuff and list of moderation targets, with counts.
		return [
			'pending' => [],
			'games' => [],
			'categories' => [],
		];
	});

	// Moderators management
	Route::get   ('/moderators',                              [ModeratorAssignmentController::class, 'globalIndex'   ]);
	Route::put   ('/moderators/{user}',                       [ModeratorAssignmentController::class, 'globalAdd'     ]);
	Route::delete('/moderators/{user}',                       [ModeratorAssignmentController::class, 'globalRemove'  ]);
	Route::get   ('/games/{game}/moderators',                 [ModeratorAssignmentController::class, 'gameIndex'     ]);
	Route::put   ('/games/{game}/moderators/{user}',          [ModeratorAssignmentController::class, 'gameAdd'       ]);
	Route::delete('/games/{game}/moderators/{user}',          [ModeratorAssignmentController::class, 'gameRemove'    ]);
	Route::get   ('/categories/{category}/moderators',        [ModeratorAssignmentController::class, 'categoryIndex' ]);
	Route::put   ('/categories/{category}/moderators/{user}', [ModeratorAssignmentController::class, 'categoryAdd'   ]);
	Route::delete('/categories/{category}/moderators/{user}', [ModeratorAssignmentController::class, 'categoryRemove']);

	// Simple runs verification
	Route::post('/runs/{run}/voteVerify', [RunVerificationController::class, 'vote']);
});
Route::get('/runs', [RunController::class, 'index']);
Route::apiResource('users', UserController::class);
Route::apiResource('games', GameController::class);
Route::apiResource('games.categories', CategoryController::class)->shallow();
Route::apiResource('games.categories.runs', RunController::class)->shallow();

// Simple runs verifications listing
Route::get('/runs/{run}/verifiers', [RunVerificationController::class, 'index']);


