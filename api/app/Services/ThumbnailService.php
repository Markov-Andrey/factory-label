<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ThumbnailService
{
    /**
     * Сохранить изображение предпросмотра
     */
    public static function savePreviewImage(int $id, string $base64png): string
    {
        $storagePath = storage_path('app/public/previews');
        File::ensureDirectoryExists($storagePath);

        $fileName = "preview_{$id}_" . time() . ".png";
        $decoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64png));

        file_put_contents("$storagePath/$fileName", $decoded);

        return "storage/previews/$fileName";
    }

    /**
     * Удалить файл предпросмотра
     */
    public static function delete(string $previewPath): bool
    {
        $filePath = public_path($previewPath);
        return File::exists($filePath) && File::delete($filePath);
    }

    /**
     * Сделать копию файла предпросмотра
     */
    public static function duplicate(?string $previewPath): ?string
    {
        if (empty($previewPath)) return null;

        $fullPath = public_path($previewPath);
        if (!File::exists($fullPath)) return null;

        $pathInfo = pathinfo($fullPath);
        $newFileName = "{$pathInfo['filename']}_copy_" . time() . ".{$pathInfo['extension']}";
        $newFullPath = $pathInfo['dirname'] . DIRECTORY_SEPARATOR . $newFileName;

        return copy($fullPath, $newFullPath)
            ? str_replace(public_path() . DIRECTORY_SEPARATOR, '', $newFullPath)
            : null;
    }
}
