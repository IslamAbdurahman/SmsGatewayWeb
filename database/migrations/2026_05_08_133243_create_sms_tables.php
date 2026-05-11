<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('sms_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->nullable()->constrained('sms_groups')->onDelete('set null');
            $table->string('phone');
            $table->string('name')->nullable();

            $table->index('phone');
            $table->unique(['group_id', 'phone']);
        });

        Schema::create('sms_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message_body');
        });

        Schema::create('sms_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained('sms_contacts')->onDelete('cascade');
            $table->foreignId('sms_template_id')->constrained('sms_templates')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message_body');
            $table->string('status');
            $table->timestamp('sent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_history');
        Schema::dropIfExists('sms_templates');
        Schema::dropIfExists('sms_contacts');
        Schema::dropIfExists('sms_groups');
    }
};
