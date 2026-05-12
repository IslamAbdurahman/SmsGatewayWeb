<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\SmsHistoryResource;
use App\Models\SmsGroup;
use App\Models\SmsHistory;
use App\Models\SmsTemplate;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SmsHistoryController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response
    {
        $isAdmin = auth()->user()->hasRole('Admin');
        $query = SmsHistory::with(['contact.group', 'template', 'user'])->latest('sent_at');

        if ($isAdmin) {
            if ($userId = $request->input('user_id')) {
                $query->where('user_id', $userId);
            }
        } else {
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

        $perPage = $request->input('per_page', 20);
        $perPage = $perPage === 'all' ? 1000000 : (int)$perPage;

        return Inertia::render('History/Index', [
            'history'   => SmsHistoryResource::collection($query->paginate($perPage)->withQueryString()),
            'filters'   => $request->only(['status', 'search', 'from', 'to', 'group_id', 'template_id', 'user_id', 'per_page']),
            'groups'    => $groups,
            'templates' => $templates,
            'users'     => $isAdmin ? User::all(['id', 'name']) : [],
        ]);
    }
}
