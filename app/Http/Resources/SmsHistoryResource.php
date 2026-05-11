<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SmsHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'message_body' => $this->message_body,
            'status'       => $this->status,
            'sent_at'      => $this->sent_at?->format('Y-m-d H:i'),
            'contact'      => $this->whenLoaded('contact', fn () => [
                'phone'      => $this->contact->phone,
                'name'       => $this->contact->name,
                'group_name' => $this->contact->group?->name,
            ]),
            'template'     => $this->whenLoaded('template', fn () => $this->template ? [
                'title' => $this->template->title,
            ] : null),
        ];
    }
}
