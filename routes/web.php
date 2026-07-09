<?php

use Illuminate\Support\Facades\Route;

// Admin Panel SPA Route
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Public Client SPA Route (excludes API and admin routes)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|admin).*');
