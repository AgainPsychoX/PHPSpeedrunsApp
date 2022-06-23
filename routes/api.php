<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RunController;
use App\Http\Controllers\ModeratorAssignmentController;
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
		$user->showIsAdmin = true;
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
	Route::get   ('/moderators',                            [ModeratorAssignmentController::class, 'globalIndex'   ]);
	Route::put   ('/moderators/{user}',                     [ModeratorAssignmentController::class, 'globalAdd'     ]);
	Route::delete('/moderators/{user}',                     [ModeratorAssignmentController::class, 'globalRemove'  ]);
	Route::get   ('/games/{game}/moderators',               [ModeratorAssignmentController::class, 'gameIndex'     ]);
	Route::put   ('/games/{game}/moderators/{user}',        [ModeratorAssignmentController::class, 'gameAdd'       ]);
	Route::delete('/games/{game}/moderators/{user}',        [ModeratorAssignmentController::class, 'gameRemove'    ]);
	Route::get   ('/category/{category}/moderators',        [ModeratorAssignmentController::class, 'categoryIndex' ]);
	Route::put   ('/category/{category}/moderators/{user}', [ModeratorAssignmentController::class, 'categoryAdd'   ]);
	Route::delete('/category/{category}/moderators/{user}', [ModeratorAssignmentController::class, 'categoryRemove']);
});
Route::apiResource('users', UserController::class);
Route::apiResource('games', GameController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('runs', RunController::class);
