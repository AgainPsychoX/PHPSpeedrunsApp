<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
	use HasFactory;

	protected $fillable = [
		'game_id',
		'name',
		'rules',
		'score_rule',
		'verification_requirement'
	];

	protected $attributes = [
		'score_rule' => 'none',
		'verification_requirement' => 1,
	];

	// protected $appends = [
	// 	'runsCount'
	// ];

	public function game()
	{
		return $this->belongsTo(Game::class);
	}

	public function runs()
	{
		return $this->hasMany(Run::class);
	}

	// public function getRunsCountAttribute() {
	// 	return $this->runs()->count();
	// }

	public function moderators()
	{
		return $this->morphMany(ModeratorAssignment::class, 'target');
	}
}
