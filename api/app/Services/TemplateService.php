<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class TemplateService
{
    public static function all(?string $tag = null)
    {
        $query = DB::table('LABELER_TEMPLATES')
            ->select('ID', 'NAME', 'TAGS', 'PREVIEW_PATH', 'UPDATED_AT')
            ->orderByDesc('UPDATED_AT');

        if ($tag !== null && $tag !== '') {
            $query->where('TAGS', $tag);
        }

        return $query->paginate(20);
    }

    // Все уникальные теги
    public static function tags(): array
    {
        $rows = DB::select('SELECT DISTINCT TAGS FROM LABELER_TEMPLATES WHERE TAGS IS NOT NULL');
        return array_values(array_filter(array_map(fn($row) => $row->tags, $rows)));
    }

    public static function find(int $id)
    {
        $result = DB::selectOne("SELECT * FROM LABELER_TEMPLATES WHERE ID = ?", [$id]);
        if (empty($result)) return null;
        return (array) $result;
    }
    public static function duplicate(array $data)
    {
        $template = DB::table('LABELER_TEMPLATES')->where('ID', $data['id'])->first();
        if (!$template) {
            throw new \Exception("Template not found");
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
    public static function create(array $data)
    {
        DB::table('LABELER_TEMPLATES')->insert([
            'NAME' => $data['name'],
            'TAGS' => $data['tags'],
        ]);
        return DB::table('LABELER_TEMPLATES')->max('ID');
    }

    public static function update(int $id, array $data)
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

    public static function delete(int $id)
    {
        $template = DB::table('LABELER_TEMPLATES')->where('ID', $id)->first();
        if (!$template) return;
        if ($template->preview_path) ThumbnailService::delete($template->preview_path);
        DB::table('LABELER_TEMPLATES')->where('ID', $id)->delete();
    }
}

