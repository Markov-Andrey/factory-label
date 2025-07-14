<?php

use App\Http\Controllers\Gs1DataMarkController;
use App\Http\Controllers\LabelTemplateController;
use App\Http\Controllers\PreviewController;
use Illuminate\Support\Facades\Route;

Route::post('/get-svg', [Gs1DataMarkController::class, 'index']);
Route::prefix('templates')->controller(LabelTemplateController::class)->group(function () {
    Route::get('/', 'index'); // пагинация
    Route::get('/tags', 'tags'); // все теги
    Route::get('{id}', 'show'); // поиск 1 записи
    Route::post('/store', 'store'); // создать пустой
    Route::patch('{id}', 'update'); // обновить
    Route::delete('{id}', 'destroy'); // удалить
    Route::post('duplicate', 'duplicate'); // копия
});
Route::post('/generate-preview', [PreviewController::class, 'preview']); // предпросмотр 1 элемента
Route::post('/upload-data', [PreviewController::class, 'upload']); // получить весь архив
