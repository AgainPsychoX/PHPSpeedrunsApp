<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Run extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'user_id',
        'duration',
        'score',
        'video_url',
        'notes',
        'state',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
