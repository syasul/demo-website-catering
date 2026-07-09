<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PricingTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'min_pax',
        'discount_percent',
    ];

    protected $casts = [
        'min_pax' => 'integer',
        'discount_percent' => 'decimal:2',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
