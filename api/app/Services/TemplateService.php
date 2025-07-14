<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class TemplateService
{
    protected ThumbnailService $thumbnailService;

    public function __construct(ThumbnailService $thumbnailService)
    {
        $this->thumbnailService = $thumbnailService;
    }

    public function all(): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return DB::table('LABELER_TEMPLATES')
            ->select('ID', 'NAME', 'TAGS', 'PREVIEW_PATH', 'UPDATED_AT')
            ->orderByDesc('UPDATED_AT')
            ->paginate(20);
    }

    public function tags(): array
    {
        return [];
        // Получаем все теги, разбираем строку через запятую, делаем unique
    }

    public function find(int $id)
    {
        return DB::table('LABELER_TEMPLATES')->where('ID', $id)->first();
    }

    public function create(array $data)
    {
        // 1) Валидация
        // 2) Вставка в БД:
        $newId = DB::table('LABELER_TEMPLATES')->insertGetId([
            'NAME'         => $data['name'],
            'TEMPLATE'     => $data['template'],
            'PREVIEW_PATH' => $data['preview_path'],
            'TAGS'         => implode(',', $data['tags']),
            // CREATED_AT и UPDATED_AT сработают триггером
        ]);
        // 3) Генерация превью
        $this->thumbnailService->generate($data['preview_path']);
        return $newId;
    }

    public function update(int $id, array $data)
    {
        $old = $this->find($id);
        DB::table('LABELER_TEMPLATES')
            ->where('ID', $id)
            ->update([
                'NAME'         => $data['name'],
                'TEMPLATE'     => $data['template'],
                'PREVIEW_PATH' => $data['preview_path'],
                'TAGS'         => implode(',', $data['tags']),
                // UPDATED_AT триггером
            ]);
        $this->thumbnailService->update($old->PREVIEW_PATH, $data['preview_path']);
    }

    public function delete(int $id)
    {
        $old = $this->find($id);
        DB::table('LABELER_TEMPLATES')->where('ID', $id)->delete();
        $this->thumbnailService->delete($old->PREVIEW_PATH);
    }
}
