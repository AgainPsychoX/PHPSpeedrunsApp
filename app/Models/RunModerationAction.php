<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Run;
use App\Models\User;

class RunModerationAction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'run_id',
        'user_id',
        'action',
        'note',
    ];

    public function run()
    {
        return $this->belongsTo(Run::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
