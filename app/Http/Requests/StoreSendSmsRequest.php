<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSendSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'results'                 => ['required', 'array', 'min:1'],
            'results.*.contact_id'    => ['required', 'exists:sms_contacts,id'],
            'results.*.status'        => ['required', 'in:sent,failed'],
            'results.*.message_body'  => ['required', 'string'],
            'sms_template_id'         => ['nullable', 'exists:sms_templates,id'],
        ];
    }
}
