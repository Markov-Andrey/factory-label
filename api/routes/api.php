<?php

use App\Http\Controllers\LabelTemplateController;
use App\Http\Controllers\PreviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('templates')->controller(LabelTemplateController::class)->group(function () {
    Route::get('/', 'index'); // пагинация
    Route::get('/tags', 'tags'); // все теги
    Route::get('{id}', 'show'); // поиск 1 записи
    Route::post('/store', 'store'); // создать пустой
    Route::patch('{id}', 'update'); // обновить
    Route::delete('{id}', 'destroy'); // удалить
    Route::post('duplicate', 'duplicate'); // копия
});
Route::prefix('previews')->controller(PreviewController::class)->group(function () {
    Route::post('/', 'preview');                // генерация предпросмотра
    Route::post('/upload', 'upload');           // загрузить полный пакет данных
    Route::get('/status/{jobId}', 'status');    // получить статус задания
});
