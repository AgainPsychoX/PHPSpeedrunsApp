<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $attributes = [
        'score_rule' => 'none',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
