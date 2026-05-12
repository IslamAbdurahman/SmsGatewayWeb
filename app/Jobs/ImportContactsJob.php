<?php

namespace App\Jobs;

use App\Imports\ContactsImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Facades\Excel;

class ImportContactsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Job maximum runtime in seconds */
    public int $timeout = 300;

    public function __construct(
        protected int    $groupId,
        protected string $filePath,   // full path to the stored temp file
        protected string $cacheKey,   // unique key to store result in cache
    ) {}

    public function handle(): void
    {
        $import = new ContactsImport($this->groupId);

        Excel::import($import, $this->filePath);

        // Store result summary in cache for 10 minutes so the frontend can read it
        Cache::put($this->cacheKey, [
            'status'     => 'done',
            'imported'   => $import->imported,
            'skipped'    => $import->skipped,
            'duplicates' => $import->duplicates,
        ], now()->addMinutes(10));

        // Clean up temp file
        if (file_exists($this->filePath)) {
            unlink($this->filePath);
        }
    }

    public function failed(\Throwable $e): void
    {
        Cache::put($this->cacheKey, [
            'status' => 'failed',
            'error'  => $e->getMessage(),
        ], now()->addMinutes(10));
    }
}
