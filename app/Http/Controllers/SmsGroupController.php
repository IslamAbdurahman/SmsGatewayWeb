<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsGroupRequest;
use App\Http\Resources\SmsGroupResource;
use App\Models\SmsGroup;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Response as FacadeResponse;

class SmsGroupController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(): Response
    {
        $query = SmsGroup::withCount('contacts')->latest('id');
        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }

        return Inertia::render('SmsGroups/Index', [
            'groups' => SmsGroupResource::collection($query->get()),
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

    public function show(SmsGroup $smsGroup): Response
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }

        return Inertia::render('SmsGroups/Show', [
            'group'    => $smsGroup,
            'contacts' => $smsGroup->contacts()->latest('id')->get(),
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

        $import = new \App\Imports\ContactsImport($smsGroup->id);
        \Maatwebsite\Excel\Facades\Excel::import($import, $request->file('file'));

        return redirect()->back()->with('flash', [
            'imported'   => $import->imported,
            'skipped'    => $import->skipped,
            'duplicates' => $import->duplicates,
        ]);
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
