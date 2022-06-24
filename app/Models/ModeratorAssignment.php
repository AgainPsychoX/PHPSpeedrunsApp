<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

	protected $casts = [
		'assigned_at' => 'datetime',
		'revoked_at' => 'datetime',
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



	public static function scopeActive(Builder $query)
	{
		return $query->whereNull('revoked_at');
	}

	public function scopeGlobal(Builder $query)
	{
		return $query->where('target_type', 'global');
	}

	public static function scopeGame(Builder $query, Game|int $game, $direct = false)
	{
		$query = $query->addSelect(['target_type', 'target_id']);
		if ($direct)
			return $query
				->where('target_type', 'game')
				->where('target_id', $game instanceof Game ? $game->id : $game);
		else
			return $query->where(fn ($query) =>
				$query->where('target_type', 'global')
					->orWhere('target_type', 'game')->where('target_id', $game instanceof Game ? $game->id : $game)
			);
	}

	public static function scopeCategory(Builder $query, Category|int $category, $direct = false)
	{
		$query = $query->addSelect(['target_type', 'target_id']);
		if ($direct)
			return $query
				->where('target_type', 'category')
				->where('target_id', $category instanceof Category ? $category->id : $category);
		else
			if (is_int($category)) {
				$gameId = Category::findOrFail($category)->game_id;
			}
			else {
				$gameId = $category->game_id;
			}
			return $query->where(fn ($query) =>
				$query->where('target_type', 'global')
					->orWhere(fn ($query) =>
						$query->where('target_type', 'game')
							  ->where('target_id', $gameId)
					)
					->orWhere(fn ($query) =>
						$query->where('target_type', 'category')
							  ->where('target_id', $category instanceof Category ? $category->id : $category)
					)
			);
	}

	public static function scopeAny(Builder $query) {
		return $query->addSelect('target_type')->where(function ($query) {
			$query->where('target_type', 'global')
				->orWhere('target_type', 'game')
				->orWhere('target_type', 'category');
		});
	}



	public static function scopeOrderByScope(Builder $query) {
		return $query->orderByRaw("FIELD(`target_type`, 'global', 'game', 'category')");
	}



	public static function widestScopePerUser() {
		return ModeratorAssignment::select(DB::raw("ELT(MAX(FIELD(`target_type`, 'global', 'game', 'category')), 'global', 'game', 'category') as `widest_target_type`"), 'user_id')->groupBy('user_id');
	}

	public static function scopeJoinWidestScopePerUser(Builder $query) {
		return $query->joinSub(ModeratorAssignment::widestScopePerUser(), 'w', fn ($join) => $join->on('w.user_id', '=', 'moderator_assignments.user_id'));
	}

	public static function scopeJoinUser(Builder $query, $fields = ['id', 'name', 'email', 'created_at']) {
		return $query->joinSub(User::select($fields), 'users', fn ($join) => $join->on('users.id', '=', 'moderator_assignments.user_id'));
	}

	public static function scopeJoinAssignedBy(Builder $query, $fields = ['id', 'name']) {
		return $query->leftJoinSub(User::select($fields), 'assigned_by_user', fn ($join) => $join->on('assigned_by_user.id', '=', 'moderator_assignments.assigned_by'));
	}
}
