<?php

namespace App\Models;

use App\Traits\Paginatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Run extends Model
{
	use HasFactory;
	use Paginatable;

	protected $fillable = [
		'category_id',
		'user_id',
		'duration',
		'score',
		'video_url',
		'notes',
		'state',
	];

	protected $with = [
		'user:id,name',
	];

	public function category()
	{
		return $this->belongsTo(Category::class);
	}

	public function game()
	{
		return $this->category->game();
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}



	public static function scopeUser(Builder $query, User|int $user)
	{
		return $query->where('user_id', $user instanceof User ? $user->id : $user);
	}

	public static function scopeGame(Builder $query, Game|int $game)
	{
		return $query
			->joinSub(Category::select(['id', 'gameId']), 'categories', fn ($join) => $join->on('categories.id', '=', 'runs.category_id'))
			->where('game_id', $game instanceof Game ? $game->id : $game);
	}

	public static function scopeCategory(Builder $query, Category|int $category)
	{
		return $query->where('category_id', $category instanceof Category ? $category->id : $category);
	}

	public static function scopePopulateEntry(Builder $query)
	{
		return $query
			->joinSub(Category::select(['id', 'name', 'game_id']), 'categories', fn ($join) => $join->on('categories.id', '=', 'runs.category_id'))
			->joinSub(Game::select(['id', 'name', 'publish_year']), 'games', fn ($join) => $join->on('games.id', '=', 'categories.game_id'))
			->addSelect([
				'runs.*',
				'categories.name as category_name',
				'games.id as game_id',
				'games.name as game_name',
				'games.publish_year as game_year'
			]);
	}
}
