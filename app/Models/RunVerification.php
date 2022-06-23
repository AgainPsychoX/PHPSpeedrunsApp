<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Run;
use App\Models\User;

class RunVerification extends Model
{
	use HasFactory;

	public $timestamps = false;

	protected $fillable = [
		'run_id',
		'user_id',
		'vote',
		'notes',
		'timestamp',
	];

	protected $casts = [
		'timestamp' => 'datetime',
	];

	public function run()
	{
		return $this->belongsTo(Run::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}



	public static function scopeForRunWithModerator(Builder $query, Run $run) {
		return $query
			->joinSub(User::select(['id', 'name' /*, 'email'*/]), 'users', fn ($join) => $join->on('users.id', '=', 'run_verifications.user_id'))
			->joinSub(ModeratorAssignment::category($run->category_id)->widestScopePerUser()->select(['user_id', 'target_type']), 'a', fn ($join) => $join->on('a.user_id', '=', 'users.id'))
			->addSelect([
				'run_verifications.*',
				'users.id', 'users.name', /*'users.email as user_email',*/ 'target_type'
			]);
	}
}
