<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsHistory extends Model
{
    protected $table = 'sms_histories';

    public $timestamps = false;

    protected $fillable = ['contact_id', 'sms_template_id', 'user_id', 'message_body', 'status', 'sent_at'];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(SmsContact::class, 'contact_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(SmsTemplate::class, 'sms_template_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
