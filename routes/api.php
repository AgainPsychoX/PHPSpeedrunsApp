<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RunController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
	$user = $request->user();
	$user->showIsAdmin = true;
	return new UserDetailsResource($user->loadCount('runs'));
});

Route::apiResource('users', UserController::class);
Route::apiResource('games', GameController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('runs', RunController::class);
