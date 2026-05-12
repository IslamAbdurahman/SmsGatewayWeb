<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsContactRequest;
use App\Http\Resources\SmsContactResource;
use App\Models\SmsContact;
use App\Models\SmsGroup;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;

class SmsContactController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(): Response
    {
        $userId = auth()->id();

        $contactsQuery = SmsContact::with('group');
        $groupsQuery = SmsGroup::query();

        if (!auth()->user()->hasRole('Admin')) {
            $contactsQuery->whereHas('group', fn ($q) => $q->where('user_id', $userId));
            $groupsQuery->where('user_id', $userId);
        }

        return Inertia::render('Contacts/Index', [
            'contacts' => SmsContactResource::collection($contactsQuery->get()),
            'groups' => $groupsQuery->get(['id', 'name']),
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
        return redirect()->back();
    }

    public function update(StoreSmsContactRequest $request, SmsContact $contact)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($contact->group->user_id !== auth()->id(), 403);
        }
        $contact->update($request->validated());
        return redirect()->back();
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
        return redirect()->back();
    }
}
