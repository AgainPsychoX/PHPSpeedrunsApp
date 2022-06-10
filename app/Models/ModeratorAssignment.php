<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedByUser()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function target()
    {
        return $this->morphTo();
    }
}
