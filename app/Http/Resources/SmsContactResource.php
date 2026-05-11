<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SmsContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'phone'    => $this->phone,
            'name'     => $this->name,
            'group_id' => $this->group_id,
            'group'    => $this->whenLoaded('group', fn () => $this->group->name),
        ];
    }
}
