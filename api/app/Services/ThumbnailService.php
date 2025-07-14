<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ThumbnailService
{
    public function generate(string $path): void
    {
        // Генерация превью из шаблона или другого источника
        // В этом месте можно использовать GD, Imagick, Canvas, HTML-to-image и т.д.
        // Пока просто заглушка:
        if (!File::exists(public_path($path))) {
            File::put(public_path($path), ''); // создаёт пустой файл
        }
    }

    public function update(string $oldPath, string $newPath): void
    {
        if ($oldPath !== $newPath) {
            $this->delete($oldPath);
            $this->generate($newPath);
        }
    }

    public function delete(string $path): void
    {
        $fullPath = public_path($path);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}
