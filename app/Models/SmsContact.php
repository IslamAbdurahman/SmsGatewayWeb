<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SmsContact extends Model
{
    public $timestamps = false;

    protected $fillable = ['group_id', 'phone', 'name'];

    public function group(): BelongsTo
    {
        return $this->belongsTo(SmsGroup::class, 'group_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(SmsHistory::class, 'contact_id');
    }
}
