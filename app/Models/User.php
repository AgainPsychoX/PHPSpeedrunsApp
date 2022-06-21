<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array<int, string>
	 */
	protected $fillable = [
		'name',
		'email',
		'password',
		'country_id',
		'youtube_url',
		'twitch_url',
		'twitter_url',
		'discord',
		'profile_description',
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var array<int, string>
	 */
	protected $hidden = [
		'password',
		'remember_token',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'email_verified_at' => 'datetime',
	];

	public function runs()
	{
		return $this->hasMany(Run::class);
	}

	public function roles()
	{
		return $this->belongsToMany(ModeratorAssignment::class);
	}

	public function isGhost()
	{
		return empty($this->password);
	}

	public function isGlobalModerator() {
		return ModeratorAssignment::global()->where('user_id', $this->id)->exists();
	}

	public function isGameModerator(Game|int $game)
	{
		return ModeratorAssignment::gameFor($game)->where('user_id', $this->id)->exists();
	}

	public function isCategoryModerator(Category|int $category)
	{
		return ModeratorAssignment::categoryFor($category)->where('user_id', $this->id)->exists();
	}

	public function isAnyModerator() {
		return ModeratorAssignment::active()->where(function ($query) {
			$query->where('target_type', 'global')
				->orWhere('target_type', 'game')
				->orWhere('target_type', 'category')
			;
		});
	}
}
