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
        $old = self::find($id);
        DB::table('LABELER_TEMPLATES')
            ->where('ID', $id)
            ->update([
                'NAME'         => $data['name'],
                'TEMPLATE'     => $data['template'],
                'PREVIEW_PATH' => $data['preview_path'],
                'TAGS'         => $data['tags'],
            ]);

        ThumbnailService::update($old->PREVIEW_PATH, $data['preview_path']);
    }

    public static function delete(int $id)
    {
        $old = self::find($id);
        DB::table('LABELER_TEMPLATES')->where('ID', $id)->delete();
        ThumbnailService::delete($old->PREVIEW_PATH);
    }
}

