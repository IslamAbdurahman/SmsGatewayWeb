<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsGroupRequest;
use App\Http\Resources\SmsGroupResource;
use App\Models\SmsGroup;
use App\Models\User;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Response as FacadeResponse;

class SmsGroupController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(\Illuminate\Http\Request $request): Response
    {
        $isAdmin = auth()->user()->hasRole('Admin');
        $query = SmsGroup::withCount('contacts')->latest('id');

        if ($isAdmin) {
            $query->with('user');
            if ($userId = $request->input('user_id')) {
                $query->where('user_id', $userId);
            }
        } else {
            $query->where('user_id', auth()->id());
        }

        $perPage = $request->input('per_page', 20);
        $perPage = $perPage === 'all' ? 1000000 : (int)$perPage;

        return Inertia::render('SmsGroups/Index', [
            'groups' => SmsGroupResource::collection($query->paginate($perPage)->withQueryString()),
            'users' => $isAdmin ? User::all(['id', 'name']) : [],
            'filters' => $request->only(['user_id', 'per_page']),
        ]);
    }

    public function store(StoreSmsGroupRequest $request)
    {
        $this->service->createGroup($request->validated());
        return redirect()->back()->with('success', __('Record created successfully.'));
    }

    public function update(StoreSmsGroupRequest $request, SmsGroup $smsGroup)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }
        $smsGroup->update(['name' => $request->validated()['name']]);
        return redirect()->back()->with('success', __('Record updated successfully.'));
    }

    public function show(\Illuminate\Http\Request $request, SmsGroup $smsGroup): Response
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }

        $perPage = $request->input('per_page', 20);
        $perPage = $perPage === 'all' ? 1000000 : (int)$perPage;

        return Inertia::render('SmsGroups/Show', [
            'group'    => $smsGroup,
            'contacts' => \App\Http\Resources\SmsContactResource::collection($smsGroup->contacts()->latest('id')->paginate($perPage)->withQueryString()),
            'filters'  => $request->only(['per_page']),
        ]);
    }

    public function importContacts(\Illuminate\Http\Request $request, SmsGroup $smsGroup)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        // Store file to disk so the job can read it
        $filePath = $request->file('file')->store('imports/contacts', 'local');
        $fullPath = storage_path('app/' . $filePath);

        // Unique key used to poll import status
        $cacheKey = 'import_' . $smsGroup->id . '_' . auth()->id() . '_' . time();

        // Mark as queued in cache immediately so frontend knows it started
        \Illuminate\Support\Facades\Cache::put($cacheKey, ['status' => 'queued'], now()->addMinutes(10));

        \App\Jobs\ImportContactsJob::dispatch($smsGroup->id, $filePath, $cacheKey);

        return redirect()->back()->with('flash', [
            'import_queued' => true,
            'cache_key'     => $cacheKey,
        ]);
    }

    public function checkImportStatus(\Illuminate\Http\Request $request)
    {
        $key = $request->input('key');
        if (!$key) return response()->json(['status' => 'error', 'message' => 'No key provided'], 400);

        $status = \Illuminate\Support\Facades\Cache::get($key);

        return response()->json($status ?? ['status' => 'not_found']);
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sms_contacts_template.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['phone', 'name']);
            fputcsv($file, ['998901234567', 'John Doe']);
            fclose($file);
        };

        return FacadeResponse::stream($callback, 200, $headers);
    }

    public function destroy(SmsGroup $smsGroup)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }

        if ($smsGroup->contacts()->exists()) {
            return redirect()->back()->with('error', __('Selected group has contacts. Delete contacts first.'));
        }

        $smsGroup->delete();
        return redirect()->back()->with('success', __('Record deleted successfully.'));
    }
}
