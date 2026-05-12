<?php

use App\Http\Controllers\SendSmsController;
use App\Http\Controllers\SmsGroupController;
use App\Http\Controllers\SmsContactController;
use App\Http\Controllers\SmsTemplateController;
use App\Http\Controllers\SmsHistoryController;
use App\Http\Resources\SmsHistoryResource;
use App\Models\SmsContact;
use App\Models\SmsGroup;
use App\Models\SmsHistory;
use App\Models\SmsTemplate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::get('dashboard', function () {
        $userId = auth()->id();
        $isAdmin = auth()->user()->hasRole('Admin');

        $groupsCount = $isAdmin ? SmsGroup::count() : SmsGroup::where('user_id', $userId)->count();
        $contactsCount = $isAdmin ? SmsContact::count() : SmsContact::whereHas('group', fn ($q) => $q->where('user_id', $userId))->count();
        $templatesCount = $isAdmin ? SmsTemplate::count() : SmsTemplate::where('user_id', $userId)->count();
        
        $historyQuery = SmsHistory::query();
        if (!$isAdmin) {
            $historyQuery->where('user_id', $userId);
        }

        $dailyStats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = today()->subDays($i);
            $dailyStats[] = [
                'date'   => $date->format('Y-m-d'),
                'label'  => $date->format('d-M'),
                'sent'   => (clone $historyQuery)->whereDate('sent_at', $date)->where('status', 'sent')->count(),
                'failed' => (clone $historyQuery)->whereDate('sent_at', $date)->where('status', 'failed')->count(),
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'groups'     => $groupsCount,
                'contacts'   => $contactsCount,
                'templates'  => $templatesCount,
                'sent_today' => (clone $historyQuery)->whereDate('sent_at', today())->where('status', 'sent')->count(),
                'pending'    => (clone $historyQuery)->where('status', 'pending')->count(),
                'failed'     => (clone $historyQuery)->where('status', 'failed')->count(),
            ],
            'daily_stats' => $dailyStats,
            'recent_history' => SmsHistoryResource::collection(
                (clone $historyQuery)->with(['contact', 'template'])->latest('sent_at')->limit(5)->get()
            ),
        ]);
    })->name('dashboard');

    Route::get('sms-groups/download-template', [SmsGroupController::class, 'downloadTemplate'])->name('sms-groups.download-template');
    Route::resource('sms-groups', SmsGroupController::class);
    Route::post('sms-groups/{sms_group}/import', [SmsGroupController::class, 'importContacts'])->name('sms-groups.import');
    Route::get('sms-groups/import-status', [SmsGroupController::class, 'checkImportStatus'])->name('sms-groups.import-status');
    Route::resource('contacts', SmsContactController::class);
    Route::resource('templates', SmsTemplateController::class);
    Route::resource('history', SmsHistoryController::class)->only(['index']);

    Route::get('send-sms/check', [SendSmsController::class, 'checkDuplicates'])->name('send-sms.check');
    Route::get('send-sms', [SendSmsController::class, 'create'])->name('send-sms.create');
    Route::post('send-sms', [SendSmsController::class, 'store'])->name('send-sms.store');

    Route::resource('users', \App\Http\Controllers\UserController::class)->middleware('role:Admin');
});

require __DIR__.'/settings.php';
Route::get('auth/google', [App\Http\Controllers\Auth\SocialiteController::class, 'redirect'])->name('google.redirect');
Route::get('auth/google/callback', [App\Http\Controllers\Auth\SocialiteController::class, 'callback'])->name('google.callback');

Route::get('lang/{locale}', function ($locale) {
    if (in_array($locale, ['uz', 'ru', 'en'])) {
        session()->put('locale', $locale);
    }
    return redirect()->back();
})->name('lang.switch');

require __DIR__.'/auth.php';
