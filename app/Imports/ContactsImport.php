<?php

namespace App\Imports;

use App\Models\SmsContact;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class ContactsImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    public int $imported   = 0;
    public int $skipped    = 0;
    public int $duplicates = 0;

    public function __construct(protected int $groupId)
    {
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
        // Load existing phones for duplicate check
        $existingPhones = SmsContact::where('group_id', $this->groupId)
            ->pluck('phone')
            ->toArray();

        $toInsert = [];

        \Illuminate\Support\Facades\Log::info('ContactsImport starting', [
            'group_id' => $this->groupId,
            'row_count' => count($rows),
            'first_row_keys' => count($rows) > 0 ? array_keys($rows[0]->toArray()) : 'empty'
        ]);

        foreach ($rows as $index => $row) {
            // Accept 'phone', 'telefon', 'tel', 'number' column names
            $phone = $row['phone']
                ?? $row['telefon']
                ?? $row['tel']
                ?? $row['number']
                ?? $row['mobil']
                ?? null;

            // Accept 'name', 'ism', 'fullname', 'full_name' column names
            $name = $row['name']
                ?? $row['ism']
                ?? $row['fullname']
                ?? $row['full_name']
                ?? null;

            if (!$phone) {
                \Illuminate\Support\Facades\Log::warning("Row {$index} skipped: No phone found", ['row' => $row->toArray()]);
                $this->skipped++;
                continue;
            }

            // Clean phone — keep digits only, then prepend +
            $phone = preg_replace('/[^0-9]/', '', (string) $phone);

            if (strlen($phone) < 7) {
                $this->skipped++;
                continue;
            }

            $phone = '+' . $phone;

            // Skip if already in DB
            if (in_array($phone, $existingPhones)) {
                $this->duplicates++;
                continue;
            }

            // Skip if duplicate within this batch
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
            SmsContact::insert(array_values($toInsert));
        }
    }
}
