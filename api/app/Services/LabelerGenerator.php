<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use ZipArchive;

class LabelerGenerator
{
    public function preview(array $data)
    {
        $templateArr = $this->getTemplateArray($data['template_id']);
        $this->fillTemplateObjects($templateArr['objects'], $data['data']);

        $directory = storage_path('app/public/tmp');
        if (!is_dir($directory)) mkdir($directory, 0755, true);

        $filePath = $directory . DIRECTORY_SEPARATOR . 'tmp.json';
        file_put_contents($filePath, json_encode($templateArr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $nodeOutput = trim(NodeService::runNodeScript($filePath));
        unlink($filePath);

        return url('storage/tmp/' . $nodeOutput);
    }

    public function upload(array $data): array
    {
        return LabelerJobService::create($data);
    }

    public static function getNextQueuedJob()
    {
        $job = LabelerJobService::claimNextJob();
        (new LabelerGenerator)->work((array) $job);

        return $job;
    }

    public function work(array $data)
    {
        $jobId = $data['id'];

        $templateArr = $this->getTemplateArray($data['template_id']);
        $data['data'] = json_decode($data['data'], true);
        $uploadDir = storage_path('app/public/uploads');
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $resultFiles = [];
        $done = 0;

        try {
            foreach ($data['data'] as $index => $item) {
                $tempCopy = $templateArr;
                $this->fillTemplateObjects($tempCopy['objects'], $item);

                $jsonFilePath = $uploadDir . DIRECTORY_SEPARATOR . 'upload_' . time() . "_{$index}.json";
                file_put_contents($jsonFilePath, json_encode($tempCopy, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                $nodeOutput = trim(NodeService::runNodeScript($jsonFilePath));
                $resultFiles[] = $uploadDir . DIRECTORY_SEPARATOR . $nodeOutput;

                unlink($jsonFilePath);

                $done++;
                LabelerJobService::updateProgress($jobId, $done);
            }

            $zipName = 'upload_results_' . time() . '.zip';
            $zipPath = $uploadDir . DIRECTORY_SEPARATOR . $zipName;

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
                throw new \Exception('Не удалось создать архив');
            }

            foreach ($resultFiles as $file) {
                if (file_exists($file)) {
                    $zip->addFile($file, basename($file));
                }
            }

            $zip->close();

            foreach ($resultFiles as $file) {
                if (file_exists($file)) unlink($file);
            }
            LabelerJobService::markCompleted($jobId, 'storage/uploads/' . $zipName);

            return $jobId;
        } catch (\Exception $e) {
            LabelerJobService::markFailed($jobId, $e->getMessage());
            throw $e;
        }
    }

    private function getTemplateArray(int $templateId): array
    {
        $template = TemplateService::find($templateId);
        $templateArr = json_decode($template['template'], true);

        if (!isset($templateArr['objects'])) {
            throw new \Exception('Template objects not found');
        }

        return $templateArr;
    }

    private function fillTemplateObjects(array &$objects, array $data): void
    {
        foreach ($objects as &$obj) {
            $key = $obj['id'] ?? null;
            $meta = $obj['meta'] ?? null;
            $meta_type = $obj['meta_type'] ?? null;

            if (!$key || !array_key_exists($key, $data)) continue;

            $val = $data[$key];

            switch ($meta) {
                case 'datamatrix': $obj['src'] = $this->getDatamatrixSvgBase64($val); break;
                case 'barcode':    $obj['src'] = $this->generateBarcode($val, $meta_type); break;
                case 'qr':         $obj['src'] = $this->generateQr($val); break;
                case 'text':       $obj['text'] = $val; break;
            }
        }
    }

    private function getDatamatrixSvgBase64(string $value): string
    {
        $svg = GS1DataMatrixTemplateService::template1($value);
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function generateBarcode(string $value, string $meta_type = 'C128'): string
    {
        $b = new \Milon\Barcode\DNS1D();
        $svg = $b->getBarcodeSVG($value, $meta_type, h:50, showCode: false);
        $svg = preg_replace('/\s+/', ' ', trim($svg));

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function generateQr(string $value): string
    {
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($value)
            ->size(100)
            ->margin(0)
            ->build();

        return 'data:image/png;base64,' . base64_encode($result->getString());
    }
}
