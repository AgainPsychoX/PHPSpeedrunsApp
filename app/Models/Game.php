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

    public function moderators()
    {
        return $this->morphMany(ModeratorAssignment::class, 'target');
    }

    public function iconUrl()
    {
        if ($this->icon == 'none') return asset("public/images/games/placeholder/icon.png");
        return asset("public/images/games/$this->id/icon.$this->icon");
    }
}
