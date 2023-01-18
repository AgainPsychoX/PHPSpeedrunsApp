<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
		'note',
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



	public static function votesForRun(Run $run) {
		return RunVerification::where('run_id', $run->id)
			->select([
				'run_id',
				DB::raw("sum(case `vote` when 'yes' then 1 else 0 end) as `yes_count`"),
				DB::raw("sum(case `vote` when 'no' then 1 else 0 end) as `no_count`"),
				DB::raw("sum(case `vote` when 'abstain' then 1 else 0 end) as `abstain_count`"),
			])->first();
	}

	public static function forRunWithModerators(Run $run) {
		return RunVerification::where('run_id', $run->id)
			->joinSub(
				ModeratorAssignment::active()
					->category($run->category_id)
					->joinWidestScopePerUser()
					->joinUser(['id', 'name', /*'email'*/])
					->select(['users.id', 'users.name', 'widest_target_type as target_type', 'target_id'])
				,
				'a', fn ($join) => $join->on('a.id', '=', 'run_verifications.user_id'))
			->select([
				'run_verifications.user_id as id', 'name', /*'email',*/ 'target_type',
				'run_verifications.*'
			]);
	}
}
