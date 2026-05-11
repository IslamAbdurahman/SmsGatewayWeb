<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSmsContactRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'group_id' => ['required', 'exists:sms_groups,id'],
            'phone'    => ['required', 'string', 'max:20'],
            'name'     => ['nullable', 'string', 'max:255'],
        ];
    }
}
