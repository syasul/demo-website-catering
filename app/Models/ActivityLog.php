<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model',
        'model_id',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
        'model_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
