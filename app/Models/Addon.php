<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Addon extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pricing_type', // flat, per_pax
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::created(function ($addon) {
            static::logActivity('created', $addon);
        });

        static::updated(function ($addon) {
            static::logActivity('updated', $addon);
        });

        static::deleted(function ($addon) {
            static::logActivity('deleted', $addon);
        });
    }

    protected static function logActivity(string $action, $model)
    {
        $userId = auth()->id() ?? null;
        $details = [];
        if ($action === 'updated') {
            $details['before'] = array_intersect_key($model->getOriginal(), $model->getDirty());
            $details['after'] = $model->getDirty();
        } else {
            $details['state'] = $model->toArray();
        }

        \App\Models\ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'model' => 'Addon',
            'model_id' => $model->id,
            'details' => $details,
        ]);
    }
}
