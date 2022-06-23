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

	public function game()
	{
		return $this->belongsTo(Game::class);
	}

	public function runs()
	{
		return $this->hasMany(Run::class);
	}

	public function moderators($direct = false)
	{
		if ($direct)
			return ModeratorAssignment::active()->category($this, true)->joinUser()->orderBy('users.name');
		else
			return ModeratorAssignment::active()->category($this, false)->joinUser()->orderByScope()->orderBy('users.name');
	}
}
