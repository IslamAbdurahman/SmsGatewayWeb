<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\SmsHistoryResource;
use App\Models\SmsGroup;
use App\Models\SmsHistory;
use App\Models\SmsTemplate;
use Inertia\Inertia;
use Inertia\Response;

class SmsHistoryController extends Controller
{
    public function index(): Response
    {
        $query = SmsHistory::with(['contact.group', 'template'])->latest('sent_at');

        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }

        // Filter by status
        if ($status = request('status')) {
            $query->where('status', $status);
        }

        // Filter by phone or contact name
        if ($search = request('search')) {
            $query->whereHas('contact', function ($q) use ($search) {
                $q->where('phone', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($from = request('from')) {
            $query->whereDate('sent_at', '>=', $from);
        }
        if ($to = request('to')) {
            $query->whereDate('sent_at', '<=', $to);
        }

        // Filter by group (via contact's sms_group_id)
        if ($groupId = request('group_id')) {
            $query->whereHas('contact', fn ($q) => $q->where('sms_group_id', $groupId));
        }

        // Filter by template
        if ($templateId = request('template_id')) {
            $query->where('sms_template_id', $templateId);
        }

        // Build group/template lists scoped to user
        $isAdmin = auth()->user()->hasRole('Admin');
        $userId  = auth()->id();

        $groups = SmsGroup::when(!$isAdmin, fn ($q) => $q->where('user_id', $userId))
                          ->get(['id', 'name']);

        $templates = SmsTemplate::when(!$isAdmin, fn ($q) => $q->where('user_id', $userId))
                                ->get(['id', 'title']);

        return Inertia::render('History/Index', [
            'history'   => SmsHistoryResource::collection($query->paginate(25)->withQueryString()),
            'filters'   => request()->only(['status', 'search', 'from', 'to', 'group_id', 'template_id']),
            'groups'    => $groups,
            'templates' => $templates,
        ]);
    }
}
