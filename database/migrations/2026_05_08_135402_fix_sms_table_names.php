<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('sms_history', 'sms_histories');
    }

    public function down(): void
    {
        Schema::rename('sms_histories', 'sms_history');
    }
};
