<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsTemplateRequest;
use App\Http\Resources\SmsTemplateResource;
use App\Models\SmsTemplate;
use App\Models\User;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;

class SmsTemplateController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(\Illuminate\Http\Request $request): Response
    {
        $isAdmin = auth()->user()->hasRole('Admin');
        $query = SmsTemplate::latest('id');

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

        return Inertia::render('Templates/Index', [
            'templates' => SmsTemplateResource::collection($query->paginate($perPage)->withQueryString()),
            'users' => $isAdmin ? User::all(['id', 'name']) : [],
            'filters' => $request->only(['user_id', 'per_page']),
        ]);
    }

    public function store(StoreSmsTemplateRequest $request)
    {
        $this->service->createTemplate($request->validated());
        return redirect()->back()->with('success', __('Record created successfully.'));
    }

    public function update(StoreSmsTemplateRequest $request, SmsTemplate $template)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($template->user_id !== auth()->id(), 403);
        }
        $template->update($request->validated());
        return redirect()->back()->with('success', __('Record updated successfully.'));
    }

    public function destroy(SmsTemplate $template)
    {
        if (!auth()->user()->hasRole('Admin')) {
            abort_if($template->user_id !== auth()->id(), 403);
        }

        if ($template->history()->exists()) {
            return redirect()->back()->with('error', __('Cannot delete template used in message history.'));
        }

        $template->delete();
        return redirect()->back()->with('success', __('Record deleted successfully.'));
    }
}
