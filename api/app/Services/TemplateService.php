<?php
namespace App\Services;

use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TemplateService
{
    /**
     * Получить шаблоны с фильтрами и пагинацией
     */
    public static function all(?string $tag = null, ?string $name = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = DB::table('LABELER_TEMPLATES')
            ->select('ID', 'NAME', 'TAGS', 'PREVIEW_PATH', 'UPDATED_AT')
            ->orderByDesc('UPDATED_AT');
        if (!empty($tag)) $query->where('TAGS', $tag);
        if (!empty($name)) $query->where('NAME', 'like', '%' . $name . '%');

        return $query->paginate($perPage);
    }

    /**
     * Вернуть все уникальные теги
     */
    public static function tags(): array
    {
        $tags = array_column(DB::select('SELECT DISTINCT TAGS FROM LABELER_TEMPLATES WHERE TAGS IS NOT NULL'), 'tags');
        return array_merge([['key' => null, 'value' => '-']], array_map(fn($tag) => ['key' => $tag, 'value' => $tag], $tags));
    }

    /**
     * Найти шаблон по ID
     */
    public static function find(int $id): ?array
    {
        $result = DB::selectOne("SELECT * FROM LABELER_TEMPLATES WHERE ID = ?", [$id]);
        if (empty($result)) return null;
        return (array) $result;
    }

    /**
     * Дублировать шаблон
     * @throws Exception если шаблон не найден
     */
    public static function duplicate(array $data)
    {
        $template = DB::table('LABELER_TEMPLATES')->where('ID', $data['id'])->first();
        if (!$template) {
            throw new Exception("Шаблон {$data['id']} не найден");
        }

        $newPreviewPath = ThumbnailService::duplicate($template->preview_path);

        DB::table('LABELER_TEMPLATES')->insert([
            'NAME' => $data['name'],
            'TAGS' => $data['tags'],
            'TEMPLATE' => $template->template,
            'PREVIEW_PATH' => $newPreviewPath,
        ]);

        return DB::table('LABELER_TEMPLATES')->max('ID');
    }

    /**
     * Создать новый шаблон
     */
    public static function create(array $data)
    {
        DB::table('LABELER_TEMPLATES')->insert([
            'NAME' => $data['name'],
            'TAGS' => $data['tags'],
        ]);
        return DB::table('LABELER_TEMPLATES')->max('ID');
    }

    /**
     * Обновить шаблон, обновить превью
     */
    public static function update(int $id, array $data): void
    {
        $fieldsMap = [
            'name'         => 'NAME',
            'template'     => 'TEMPLATE',
            'preview_path' => 'PREVIEW_PATH',
            'tags'         => 'TAGS',
        ];

        $template = DB::table('LABELER_TEMPLATES')->where('ID', $id)->first();

        if (!empty($data['preview_png'])) {
            if ($template && !empty($template->preview_path)) {
                ThumbnailService::delete($template->preview_path);
            }
            $data['preview_path'] = ThumbnailService::savePreviewImage($id, $data['preview_png']);
        }

        $updateData = collect($fieldsMap)
            ->filter(fn($dbField, $key) => array_key_exists($key, $data))
            ->mapWithKeys(fn($dbField, $key) => [$dbField => $data[$key]])
            ->toArray();

        if ($updateData) {
            DB::table('LABELER_TEMPLATES')->where('ID', $id)->update($updateData);
        }
    }

    /**
     * Удалить шаблон
     */
    public static function delete(int $id): void
    {
        $template = DB::table('LABELER_TEMPLATES')->where('ID', $id)->first();
        if (!$template) return;
        if ($template->preview_path) ThumbnailService::delete($template->preview_path);
        DB::table('LABELER_TEMPLATES')->where('ID', $id)->delete();
    }
}

