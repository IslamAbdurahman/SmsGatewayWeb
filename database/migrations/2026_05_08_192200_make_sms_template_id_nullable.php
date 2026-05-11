<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sms_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('sms_template_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('sms_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('sms_template_id')->nullable(false)->change();
        });
    }
};
