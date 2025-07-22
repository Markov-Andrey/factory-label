<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ClearTmpUploads extends Command
{
    protected $signature = 'app:clear-tmp';
    protected $description = 'Очистить storage/tmp и storage/uploads';

    public function handle(): void
    {
        File::cleanDirectory(storage_path('app/public/tmp'));
        File::cleanDirectory(storage_path('app/public/uploads'));

        $this->info('Папки storage/tmp и storage/uploads очищены.');
    }
}
