<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class LabelerJobService
{
    protected static string $table = 'LABELER_JOBS';

    public static function create(array $data): array
    {
        $recordsTotal = count($data['data']);
        $id = DB::selectOne("SELECT LABELER_JOBS_SEQ.NEXTVAL as id FROM dual")->id;
        DB::table(self::$table)->insert([
            'ID'              => $id,
            'DATA'            => json_encode($data['data'], JSON_UNESCAPED_UNICODE),
            'STATUS'          => 'queued',
            'RECORDS_TOTAL'   => $recordsTotal,
            'RECORDS_DONE'    => 0,
            'TEMPLATE_ID'     => $data['template_id']
        ]);
        return ['id' => $id];
    }

    public static function claimNextJob(): ?object
    {
        return DB::transaction(function () {
            $inProgress = DB::table(self::$table)
                ->where('STATUS', 'processed')
                ->exists();

            if ($inProgress) {
                return null;
            }

            $job = DB::table(self::$table)
                ->where('STATUS', 'queued')
                ->orderBy('ID')
                ->lockForUpdate()
                ->first();

            if (!$job) {
                return null;
            }

            DB::table(self::$table)
                ->where('ID', $job->id)
                ->update(['STATUS' => 'processed']);

            $job->STATUS = 'processed';

            return $job;
        });
    }

    public static function updateProgress(int $jobId, int $recordsDone): void
    {
        DB::table(self::$table)
            ->where('ID', $jobId)
            ->update([
                'RECORDS_DONE' => $recordsDone,
            ]);
    }

    public static function markCompleted(int $jobId, string $zipPath): void
    {
        DB::table(self::$table)
            ->where('ID', $jobId)
            ->update([
                'STATUS'          => 'done',
                'RESULT_ZIP_PATH' => $zipPath,
            ]);
    }

    public static function markFailed(int $jobId, string $errorMessage): void
    {
        DB::table(self::$table)
            ->where('ID', $jobId)
            ->update([
                'STATUS'        => 'error',
                'ERROR_MESSAGE' => $errorMessage,
            ]);
    }

    public static function get(int $jobId): ?object
    {
        return DB::table(self::$table)->where('ID', $jobId)->first();
    }

    public static function getStatus(int $jobId): ?object
    {
        $job = DB::table(self::$table)
            ->select('STATUS', 'RECORDS_TOTAL', 'RECORDS_DONE', 'RESULT_ZIP_PATH', 'ERROR_MESSAGE')
            ->where('ID', $jobId)
            ->first();

        if ($job && $job->result_zip_path) {
            $job->result_zip_path = url($job->result_zip_path);
        }

        return $job;
    }
}
