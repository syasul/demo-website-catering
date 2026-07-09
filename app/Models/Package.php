<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price_per_pax',
        'min_pax',
        'max_pax',
        'thumbnail',
        'is_active',
    ];

    protected $casts = [
        'price_per_pax' => 'decimal:2',
        'min_pax' => 'integer',
        'max_pax' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'package_menu_item');
    }

    public function pricingTiers()
    {
        return $this->hasMany(PricingTier::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    protected static function booted()
    {
        static::created(function ($package) {
            static::logActivity('created', $package);
        });

        static::updated(function ($package) {
            static::logActivity('updated', $package);
        });

        static::deleted(function ($package) {
            static::logActivity('deleted', $package);
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
            'model' => 'Package',
            'model_id' => $model->id,
            'details' => $details,
        ]);
    }
}
