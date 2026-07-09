<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuotationActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_id',
        'user_id',
        'note',
        'activity_type', // call, wa, email, meeting, status_change
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
