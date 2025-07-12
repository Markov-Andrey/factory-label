<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\App;

Route::get('/', function () {
    $dbStatus = 'not connected';

    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Throwable $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'OK',
        'message' => 'Laravel server is running',
        'app_env' => App::environment(),
        'laravel_version' => app()->version(),
        'db_connection' => config('database.default'),
        'db_status' => $dbStatus,
    ]);
});
