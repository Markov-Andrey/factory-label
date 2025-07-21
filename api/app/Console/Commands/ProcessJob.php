<?php

namespace App\Console\Commands;

use App\Services\LabelerGenerator;
use Illuminate\Console\Command;

class ProcessJob extends Command
{
    protected $signature = 'app:process-job';
    protected $description = 'Обработать следующую задачу';

    public function handle()
    {
        $this->info('Запущена обработка задачи...');
        $job = LabelerGenerator::getNextQueuedJob();
        if (!$job) {
            $this->info('Нет задач в очереди.');
            return 0;
        }
        $this->info("Обрабатываем задачу ID: {$job->id}");

        return 0;
    }
}
