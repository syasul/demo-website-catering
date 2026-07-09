<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category_id',
        'image',
        'event_date',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'event_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
