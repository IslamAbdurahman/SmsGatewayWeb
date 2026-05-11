<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Session::has('locale')) {
            App::setLocale(Session::get('locale'));
        } else {
            // Default or detect from browser
            $locale = $request->getPreferredLanguage(['uz', 'ru', 'en']) ?: config('app.locale');
            App::setLocale($locale);
            Session::put('locale', $locale);
        }

        return $next($request);
    }
}
