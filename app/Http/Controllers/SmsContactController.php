<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsContactRequest;
use App\Http\Resources\SmsContactResource;
use App\Models\SmsContact;
use App\Models\SmsGroup;
use App\Models\User;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;

class SmsContactController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(\Illuminate\Http\Request $request): Response
    {
        $isAdmin = auth()->user()->hasRole('Admin');
        $userId = auth()->id();

        $contactsQuery = SmsContact::with(['group.user']);
        $groupsQuery = SmsGroup::query();

        if ($isAdmin) {
            if ($filterUserId = $request->input('user_id')) {
                $contactsQuery->whereHas('group', fn ($q) => $q->where('user_id', $filterUserId));
                $groupsQuery->where('user_id', $filterUserId);
            }
        } else {
            $contactsQuery->whereHas('group', fn ($q) => $q->where('user_id', $userId));
            $groupsQuery->where('user_id', $userId);
        }

        $perPage = $request->input('per_page', 20);
        $perPage = $perPage === 'all' ? 1000000 : (int)$perPage;

        return Inertia::render('Contacts/Index', [
            'contacts' => SmsContactResource::collection($contactsQuery->paginate($perPage)->withQueryString()),
            'groups' => $groupsQuery->get(['id', 'name']),
            'users' => $isAdmin ? User::all(['id', 'name']) : [],
            'filters' => $request->only(['user_id', 'per_page']),
        ]);
    }

    public function store(StoreSmsContactRequest $request)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if(
                SmsGroup::where('id', $request->group_id)
                    ->where('user_id', auth()->id())
                    ->doesntExist(),
                403
            );
        }
        $this->service->createContact($request->validated());
        return redirect()->back()->with('success', __('Record created successfully.'));
    }

    public function update(StoreSmsContactRequest $request, SmsContact $contact)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($contact->group->user_id !== auth()->id(), 403);
        }
        $contact->update($request->validated());
        return redirect()->back()->with('success', __('Record updated successfully.'));
    }

    public function destroy(SmsContact $contact)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($contact->group->user_id !== auth()->id(), 403);
        }

        if ($contact->history()->exists()) {
            return redirect()->back()->with('error', __('Cannot delete contact with message history.'));
        }

        $contact->delete();
        return redirect()->back()->with('success', __('Record deleted successfully.'));
    }
}
