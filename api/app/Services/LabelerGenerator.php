<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

class LabelerGenerator
{
    public function preview(array $data)
    {
        $template = DB::table('LABELER_TEMPLATES')->where('id', $data['template_id'])->value('template');
        $templateArr = json_decode($template, true);

        if (!isset($templateArr['objects'])) {
            throw new \Exception('Template objects not found');
        }

        foreach ($templateArr['objects'] as &$obj) {
            $key = $obj['id'] ?? null;
            $meta = $obj['meta'] ?? null;
            $meta_type = $obj['meta_type'] ?? null;

            if (!$key || !array_key_exists($key, $data['data'])) continue;

            $val = $data['data'][$key];

            if ($meta === 'datamatrix') {
                $obj['src'] = $this->getDatamatrixSvgBase64($val);
            } elseif ($meta === 'barcode') {
                $obj['src'] = $this->generateBarcode($val, $meta_type);
            } elseif ($meta === 'qr') {
                $obj['src'] = $this->generateQr($val);
            } elseif ($meta === 'text') {
                $obj['text'] = $val;
            }
        }

        $directory = storage_path('app/public/previews');
        if (!is_dir($directory)) mkdir($directory, 0755, true);

        $filePath = $directory . DIRECTORY_SEPARATOR . 'tmp.json';
        file_put_contents($filePath, json_encode($templateArr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $nodeOutput = trim(NodeService::runNodeScript($filePath));

        unlink($filePath);

        return url('storage/previews/' . $nodeOutput);
    }

    protected function getDatamatrixSvgBase64(string $value): string
    {
        $request = new Request(['codes' => [$value]]);
        $controller = new \App\Http\Controllers\Gs1DataMarkController();
        $response = $controller->index($request);
        $data = json_decode($response->getContent(), true);

        $svgCode = $data['data'][0] ?? '';

        if (preg_match('/^[A-Za-z0-9+\/=]+$/', trim($svgCode))) {
            $decodedSvg = base64_decode($svgCode);
        } else {
            $decodedSvg = $svgCode;
        }

        $base64Svg = base64_encode($decodedSvg);
        return 'data:image/svg+xml;base64,' . $base64Svg;
    }

    protected function generateBarcode(string $value, string $meta_type = 'C128'): string
    {
        $b = new \Milon\Barcode\DNS1D();
        $svg = $b->getBarcodeSVG($value, $meta_type, h:50, showCode: false);
        $svg = preg_replace('/\s+/', ' ', trim($svg));

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    protected function generateQr(string $value): string
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
