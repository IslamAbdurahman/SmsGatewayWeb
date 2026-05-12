<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialiteController extends Controller
{
    public function redirect()
    {
        if (Auth::check()) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }

        return Socialite::driver('google')
            ->stateless()
            // ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback()
    {
        try {
            \Log::info('Socialite callback started');
            $googleUser = Socialite::driver('google')->stateless()->user();
            \Log::info('Google user retrieved: ' . $googleUser->email);
            
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                \Log::info('Existing user found: ' . $user->id);
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'google_token' => $googleUser->token,
                ]);
                \Log::info('Existing user updated');
            } else {
                \Log::info('Creating new user');
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'google_token' => $googleUser->token,
                    'password' => Hash::make(Str::random(24)),
                ]);
                \Log::info('New user created: ' . $user->id);
            }

            Auth::login($user, true);
            \Log::info('User logged in, redirecting to dashboard');

            return redirect()->route('dashboard');
        } catch (\Exception $e) {
            \Log::error('Socialite error: ' . $e->getMessage());
            return redirect()->route('login')->with('error', __('Google login error'));
        }
    }
}
