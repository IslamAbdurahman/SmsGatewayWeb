<?php

namespace App\Jobs;

use App\Imports\ContactsImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
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
        Log::info('ImportContactsJob started', ['group_id' => $this->groupId, 'file' => $this->filePath]);
        
        $import = new ContactsImport($this->groupId);

        $extension = strtolower(pathinfo($this->filePath, PATHINFO_EXTENSION));
        $readerType = match ($extension) {
            'xlsx' => \Maatwebsite\Excel\Excel::XLSX,
            'xls'  => \Maatwebsite\Excel\Excel::XLS,
            'csv'  => \Maatwebsite\Excel\Excel::CSV,
            default => null,
        };

        Excel::import($import, $this->filePath, 'local', $readerType);
        
        Log::info('Excel::import finished');

        // Store result summary in cache for 10 minutes so the frontend can read it
        Cache::put($this->cacheKey, [
            'status'     => 'done',
            'imported'   => $import->imported,
            'skipped'    => $import->skipped,
            'duplicates' => $import->duplicates,
        ], now()->addMinutes(10));

        // Clean up temp file
        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($this->filePath)) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($this->filePath);
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ImportContactsJob failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        Cache::put($this->cacheKey, [
            'status' => 'failed',
            'error'  => $e->getMessage(),
        ], now()->addMinutes(10));
    }
}
