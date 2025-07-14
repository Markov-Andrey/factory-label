<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ThumbnailService
{
    public static function savePreviewImage(int $id, string $base64png): string
    {
        $storagePath = storage_path('app/public/previews');

        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }
        $fileName = 'preview_' . $id . '_' . time() . '.png';
        $base64 = preg_replace('#^data:image/\w+;base64,#i', '', $base64png);
        $decoded = base64_decode($base64);

        file_put_contents($storagePath . DIRECTORY_SEPARATOR . $fileName, $decoded);

        return 'storage/previews/' . $fileName;
    }
    public static function delete(string $previewPath): bool
    {
        $filePath = public_path($previewPath);
        if (File::exists($filePath)) {
            return File::delete($filePath);
        }
        return false;
    }
    public static function duplicate(?string $previewPath): ?string
    {
        if (empty($previewPath)) {
            return null;
        }

        $fullPath = public_path($previewPath);

        if (!file_exists($fullPath)) {
            return null;
        }

        $pathInfo = pathinfo($fullPath);
        $newFileName = $pathInfo['filename'] . '_copy_' . time() . '.' . $pathInfo['extension'];
        $storageDir = $pathInfo['dirname'];
        $newFullPath = $storageDir . DIRECTORY_SEPARATOR . $newFileName;

        if (copy($fullPath, $newFullPath)) {
            return str_replace(public_path() . DIRECTORY_SEPARATOR, '', $newFullPath);
        }

        return null;
    }
}
