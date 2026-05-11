<?php

namespace App\Imports;

use App\Models\SmsContact;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class ContactsImport implements ToCollection
{
    public int $imported = 0;
    public int $skipped = 0;
    public int $duplicates = 0;

    public function __construct(protected int $groupId)
    {
    }

    public function collection(Collection $rows)
    {
        // To avoid duplicate queries, load existing phones for this group
        $existingPhones = SmsContact::where('group_id', $this->groupId)
            ->pluck('phone')
            ->toArray();

        $toInsert = [];

        foreach ($rows as $row) {
            $phone = $row[0] ?? null;
            $name  = $row[1] ?? null;

            if (!$phone) {
                $this->skipped++;
                continue;
            }

            // Clean phone
            $phone = preg_replace('/[^0-9]/', '', (string) $phone);

            if (strlen($phone) < 7) {
                $this->skipped++;
                continue;
            }

            $phone = '+' . $phone;

            // Check if already exists in DB
            if (in_array($phone, $existingPhones)) {
                $this->duplicates++;
                continue;
            }

            // Check if duplicate within this batch
            if (isset($toInsert[$phone])) {
                $this->duplicates++;
                continue;
            }

            $toInsert[$phone] = [
                'group_id' => $this->groupId,
                'phone'    => $phone,
                'name'     => $name ? trim((string) $name) : null,
            ];

            $this->imported++;
        }

        if (!empty($toInsert)) {
            // Bulk insert is faster
            SmsContact::insert(array_values($toInsert));
        }
    }
}
