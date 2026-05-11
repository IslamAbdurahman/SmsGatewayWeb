<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SmsContact;
use App\Models\SmsGroup;
use App\Models\SmsTemplate;

class SmsService
{
    public function createGroup(array $data): SmsGroup
    {
        return auth()->user()->smsGroups()->create(['name' => $data['name']]);
    }

    public function createContact(array $data): SmsContact
    {
        return SmsContact::create($data);
    }

    public function createTemplate(array $data): SmsTemplate
    {
        return auth()->user()->smsTemplates()->create($data);
    }
}
