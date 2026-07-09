<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'package_name_snapshot',
        'price_per_pax_snapshot',
        'pax',
        'addon_ids',
        'addon_snapshot',
        'event_date',
        'event_location',
        'subtotal',
        'discount',
        'total_estimate',
        'customer_name',
        'customer_phone',
        'customer_email',
        'notes',
        'source',
        'status',
        'assigned_to',
        'lost_reason',
    ];

    protected $casts = [
        'addon_ids' => 'array',
        'addon_snapshot' => 'array',
        'price_per_pax_snapshot' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_estimate' => 'decimal:2',
        'pax' => 'integer',
        'event_date' => 'date:Y-m-d',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities()
    {
        return $this->hasMany(QuotationActivity::class)->orderBy('created_at', 'desc');
    }
}
