<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ThumbnailService
{
    public static function generate(string $path): void
    {
        // Генерация превью из шаблона или другого источника
        // Пока просто заглушка:
        if (!File::exists(public_path($path))) {
            File::put(public_path($path), ''); // создаёт пустой файл
        }
    }

    public static function update(string $oldPath, string $newPath): void
    {
        if ($oldPath !== $newPath) {
            self::delete($oldPath);
            self::generate($newPath);
        }
    }

    public static function delete(string $path): void
    {
        $fullPath = public_path($path);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}
