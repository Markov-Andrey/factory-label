<?php

namespace App\Services;

class NodeService
{
    public static function runNodeScript(string $filePath): string
    {
        $nodePath = self::getNodePath();
        $scriptPath = base_path('node_scripts/generate_image.js');
        $command = escapeshellarg($nodePath) . ' ' .
            escapeshellarg($scriptPath) . ' ' .
            escapeshellarg($filePath) . ' 2>&1';
        $output = shell_exec($command);
        if ($output === null) {
            throw new \Exception('Node.js script did not return any output.');
        }

        return $output;
    }
    public static function getNodePath(): string
    {
        $nodePath = env('NODE_PATH', '');

        if (empty($nodePath) || !file_exists($nodePath)) {
            throw new \RuntimeException('Node.js executable not found at path from .env');
        }

        return $nodePath;
    }
}
