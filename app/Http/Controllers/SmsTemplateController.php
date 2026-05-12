<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSmsTemplateRequest;
use App\Http\Resources\SmsTemplateResource;
use App\Models\SmsTemplate;
use App\Services\SmsService;
use Inertia\Inertia;
use Inertia\Response;

class SmsTemplateController extends Controller
{
    public function __construct(protected SmsService $service) {}

    public function index(): Response
    {
        $query = SmsTemplate::latest('id');
        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }

        return Inertia::render('Templates/Index', [
            'templates' => SmsTemplateResource::collection($query->get()),
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
