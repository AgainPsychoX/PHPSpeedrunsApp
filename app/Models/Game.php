<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
	use HasFactory;

	protected $fillable = [
		'name',
		'description',
		'rules',
		'icon',
		'publish_year',
	];

	public function categories()
	{
		return $this->hasMany(Category::class);
	}

	public function moderators($direct = false)
	{
		if ($direct)
			return ModeratorAssignment::active()->game($this, true)->joinUser()->orderBy('users.name');
		else
			return ModeratorAssignment::active()->game($this, false)->joinUser()->orderByScope()->orderBy('users.name');
	}

	public function iconUrl()
	{
		if (is_null($this->icon)) return asset("storage/images/games/placeholder/icon.png");
		return asset("storage/images/games/$this->id/icon.$this->icon");
	}
}
