<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class TemplateService
{
    public static function all()
    {
        return DB::table('LABELER_TEMPLATES')
            ->select('ID', 'NAME', 'TAGS', 'PREVIEW_PATH', 'UPDATED_AT')
            ->orderByDesc('UPDATED_AT')
            ->paginate(20);
    }

    // Все уникальные теги
    public static function tags(): array
    {
        return DB::table('LABELER_TEMPLATES')
            ->select('TAGS')
            ->distinct()
            ->whereNotNull('TAGS')
            ->pluck('TAGS')
            ->filter()
            ->values()
            ->all();
    }

    public static function find(int $id)
    {
        return DB::table('LABELER_TEMPLATES')->where('ID', $id)->first();
    }

    public static function create(array $data)
    {
        return DB::table('LABELER_TEMPLATES')->insertGetId([
            'NAME' => $data['name'],
            'TAGS' => $data['tags'],
        ]);
    }

    public static function update(int $id, array $data)
    {
        $fieldsMap = [
            'name'         => 'NAME',
            'template'     => 'TEMPLATE',
            'preview_path' => 'PREVIEW_PATH',
            'tags'         => 'TAGS',
        ];

        // Если есть base64-картинка, вызовем метод сервиса, который сохранит файл и вернет путь
        if (!empty($data['preview_png'])) {
            $data['preview_path'] = \App\Services\ThumbnailService::savePreviewImage($id, $data['preview_png']);
            unset($data['preview_png']);
        }

        $updateData = collect($fieldsMap)
            ->filter(fn($dbField, $key) => array_key_exists($key, $data))
            ->mapWithKeys(fn($dbField, $key) => [$dbField => $data[$key]])
            ->toArray();

        if ($updateData) {
            DB::table('LABELER_TEMPLATES')->where('ID', $id)->update($updateData);
        }
    }

    public static function delete(int $id)
    {
        DB::table('LABELER_TEMPLATES')->where('ID', $id)->delete();
    }
}

