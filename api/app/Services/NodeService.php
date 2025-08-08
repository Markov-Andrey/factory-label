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
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        $command = $isWindows ? 'where node' : env('NODE_PATH', '');
        $path = trim((string) shell_exec($command));
        if (empty($path)) {
            throw new \RuntimeException('Node.js executable not found in system PATH.');
        }

        return $path;
    }
}
