<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSendSmsRequest;
use App\Models\SmsGroup;
use App\Models\SmsHistory;
use App\Models\SmsTemplate;
use Inertia\Inertia;
use Inertia\Response;

class SendSmsController extends Controller
{
    public function create(): Response
    {
        $userId = auth()->id();

        $groupsQuery = SmsGroup::withCount('contacts');
        $templatesQuery = SmsTemplate::query();

        if (!auth()->user()->hasRole('Admin')) {
            $groupsQuery->where('user_id', $userId);
            $templatesQuery->where('user_id', $userId);
        }

        return Inertia::render('SendSms/Index', [
            'groups'    => $groupsQuery->get(['id', 'name', 'user_id']),
            'templates' => $templatesQuery->get(['id', 'title', 'message_body', 'user_id']),
        ]);
    }

    /**
     * Returns how many contacts in a group already received a specific template.
     * Called via AJAX when user selects template + group combination.
     */
    public function checkDuplicates(): \Illuminate\Http\JsonResponse
    {
        $templateId = request('template_id');
        $groupId    = request('group_id');

        if (!$templateId || !$groupId) {
            return response()->json(['already_sent' => 0, 'total' => 0]);
        }

        $group = \App\Models\SmsGroup::find($groupId);
        if (!$group) {
            return response()->json(['already_sent' => 0, 'total' => 0]);
        }

        $total = $group->contacts()->count();

        $alreadySentQuery = SmsHistory::where('sms_template_id', $templateId)
            ->where('status', 'sent')
            ->whereIn('contact_id', function($q) use ($groupId) {
                $q->select('id')->from('sms_contacts')->where('group_id', $groupId);
            });

        $alreadySentCount = (clone $alreadySentQuery)->count();

        return response()->json([
            'already_sent'            => $alreadySentCount,
            'total'                   => $total,
            'new'                     => $total - $alreadySentCount,
            'already_sent_contact_ids' => $alreadySentQuery->pluck('contact_id')->toArray(),
        ]);
    }

    public function store(StoreSendSmsRequest $request)
    {
        $validated = $request->validated();
        $userId    = auth()->id();
        $templateId = $validated['sms_template_id'] ?? null;

        // If a template was selected, find contact_ids that already received it (sent)
        $alreadySentContactIds = [];
        if ($templateId) {
            $alreadySentContactIds = SmsHistory::where('sms_template_id', $templateId)
                ->where('status', 'sent')
                ->pluck('contact_id')
                ->toArray();
        }

        $successCount = 0;
        $failedCount  = 0;
        $skippedCount = 0;

        foreach ($validated['results'] as $result) {
            // Skip if this contact already received this template
            if ($templateId && in_array($result['contact_id'], $alreadySentContactIds)) {
                $skippedCount++;
                continue;
            }

            SmsHistory::create([
                'user_id'         => $userId,
                'contact_id'      => $result['contact_id'],
                'sms_template_id' => $templateId,
                'message_body'    => $result['message_body'],
                'status'          => $result['status'],
                'sent_at'         => now(),
            ]);

            if ($result['status'] === 'sent') {
                $successCount++;
            } else {
                $failedCount++;
            }
        }

        $message = __('sms_results_summary', ['success' => $successCount, 'failed' => $failedCount]);
        if ($skippedCount > 0) {
            $message .= ' ' . __('sms_skipped_summary', ['count' => $skippedCount]);
        }

        return redirect()->back()
            ->with('flash', ['success' => $message]);
    }

    /**
     * Fetch all contacts of a specific group (AJAX).
     */
    public function getGroupContacts(SmsGroup $smsGroup): \Illuminate\Http\JsonResponse
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($smsGroup->user_id !== auth()->id(), 403);
        }

        return response()->json(
            $smsGroup->contacts()->get(['id', 'phone', 'name'])
        );
    }

    /**
     * Search contacts by phone or name (AJAX).
     */
    public function searchContacts(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $search = $request->input('q');
        if (strlen($search) < 2) return response()->json([]);

        $query = \App\Models\SmsContact::query()->with('group:id,name');

        if (!auth()->user()->hasRole('Admin')) {
            $query->whereHas('group', fn($q) => $q->where('user_id', auth()->id()));
        }

        $contacts = $query->where(function($q) use ($search) {
            $q->where('phone', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        })
        ->limit(10)
        ->get();

        return response()->json($contacts->map(fn($c) => [
            'id'    => $c->id,
            'phone' => $c->phone,
            'name'  => $c->name,
            'group_name' => $c->group->name ?? 'No Group',
        ]));
    }
}
