<?php

use App\Http\Controllers\LabelTemplateController;
use App\Http\Controllers\LabelJobController;
use Illuminate\Support\Facades\Route;

// Templates (шаблоны)
Route::prefix('templates')->controller(LabelTemplateController::class)->group(function () {
    Route::get('/', 'index');             // пагинация
    Route::get('/tags', 'tags');          // все теги
    Route::get('{id}', 'show');           // поиск одной записи
    Route::post('/store', 'store');       // создать пустой шаблон
    Route::patch('{id}', 'update');       // обновить шаблон
    Route::delete('{id}', 'destroy');     // удалить шаблон
    Route::post('duplicate', 'duplicate'); // создать копию шаблона
});

// Jobs (обработка заданий генерации)
Route::prefix('jobs')->controller(LabelJobController::class)->group(function () {
    Route::post('/', 'process');                // запустить обработку / генерацию
    Route::post('/upload', 'upload');           // загрузка полного пакета данных
    Route::get('/status/{jobId}', 'status');    // получить статус задания
});
