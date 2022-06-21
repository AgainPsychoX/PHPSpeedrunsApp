<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModeratorAssignment extends Model
{
	use HasFactory;

	public $timestamps = false;

	protected $fillable = [
		'user_id',
		'target_id',
		'target_type',
		'assigned_by',
		'assigned_at',
		'revoked_at',
		'revoked_by',
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function target()
	{
		return $this->morphTo();
	}

	public function isActive()
	{
		return is_null($this->revoked_at);
	}

	public function assignedByUser()
	{
		return $this->belongsTo(User::class, 'assigned_by');
	}

	public function revokedByUser()
	{
		return $this->belongsTo(User::class, 'revoked_by');
	}

	public static function active()
	{
		return ModeratorAssignment::whereNull('revoked_at');
	}



	public static function global()
	{
		return ModeratorAssignment::active()->where('target_type', 'global');
	}

	public static function directGameFor(Game|int $game)
	{
		return ModeratorAssignment::active()->where('target_type', 'game')->where('target_id', $game instanceof Game ? $game->id : $game);
	}

	public static function gameFor(Game|int $game)
	{
		return ModeratorAssignment::active()->where(function ($query) use($game) {
			$query->where('target_type', 'global')
				->orWhere('target_type', 'game')->where('target_id', $game instanceof Game ? $game->id : $game);
		});
	}

	public static function directCategoryFor(Category|int $category)
	{
		return ModeratorAssignment::active()->where('target_type', 'category')->where('target_id', $category instanceof Category ? $category->id : $category);
	}

	public static function categoryFor(Category|int $category)
	{
		return ModeratorAssignment::active()->where(function ($query) use($category) {
			$query->where('target_type', 'global')
				->orWhere('target_type', 'game')->where('target_id', $category->game_id)
				->orWhere('target_type', 'category')->where('target_id', $category instanceof Category ? $category->id : $category);
		});
	}
}
