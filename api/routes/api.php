<?php

use App\Http\Controllers\Gs1DataMarkController;
use App\Http\Controllers\LabelTemplateController;
use App\Http\Controllers\PreviewController;
use Illuminate\Support\Facades\Route;

Route::post('/get-svg', [Gs1DataMarkController::class, 'index']);
Route::prefix('templates')->controller(LabelTemplateController::class)->group(function () {
    Route::get('/', 'index'); // пагинация
    Route::get('/tags', 'tags');
    Route::get('{id}', 'show');
    Route::post('/store', 'store'); // создать пустой
    Route::patch('{id}', 'update');
    Route::delete('{id}', 'destroy');
});
Route::post('/generate-preview', [PreviewController::class, 'preview']); // предпросмотр 1 элемента
Route::post('/upload-data', [PreviewController::class, 'upload']); // получить весь архив
