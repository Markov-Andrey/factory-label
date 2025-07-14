<?php

use App\Http\Controllers\Gs1DataMarkController;
use App\Http\Controllers\LabelTemplateController;
use App\Http\Controllers\PreviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Milon\Barcode\DNS1D;

Route::post('/get-svg', [Gs1DataMarkController::class, 'index']);
Route::prefix('templates')->controller(LabelTemplateController::class)->group(function () {
    Route::get('/', 'index'); // пагинация
    Route::get('/tags', 'tags');
    Route::get('{id}', 'show');
    Route::post('/', 'store');
    Route::put('{id}', 'update');
    Route::delete('{id}', 'destroy');
});
Route::post('/generate-preview', [PreviewController::class, 'index']); // предпросмотр 1 элемента
Route::get('/test', function () {
    $barcodeExamples = [
        'C39'      => 'ABC123',         // Code39: цифры и буквы A-Z, мин. длина 1
        'C39+'     => 'ABC123',         // Code39 Extended
        'C39E'     => 'A12B3',          // Code39 Extended (с пробелами можно)
        'C39E+'    => 'A12B3',
        'C93'      => 'CODE93',         // Code93: цифры, буквы, спецсимволы
        'S25'      => '123456',         // Standard 2 of 5: только цифры, четная длина
        'S25+'     => '123456',         // С контрольной цифрой (просто цифры, четная длина)
        'I25'      => '123456',         // Interleaved 2 of 5: цифры, четная длина
        'I25+'     => '123456',
        'C128'     => 'AB123',          // Code128: ASCII, любая длина
        'C128A'    => 'ABCD12',         // Code128A: ASCII, заглавные буквы и цифры
        'C128B'    => 'abc123',         // Code128B: ASCII, буквы нижнего регистра и цифры
        'C128C'    => '123456',         // Code128C: цифры парой, длина четная
        'GS1-128'  => '(01)12345678901231', // GS1-128: должен начинаться с AI (01), 14 цифр после
        'EAN2'     => '12',             // EAN2: ровно 2 цифры
        'EAN5'     => '12345',          // EAN5: ровно 5 цифр
        'EAN8'     => '12345670',       // EAN8: 7 цифр + 1 контрольная (сделал 8 цифр)
        'EAN13'    => '1234567890128',  // EAN13: 12 цифр + 1 контрольная (всего 13 цифр)
        'UPCA'     => '123456789012',   // UPCA: 11 цифр + 1 контрольная (всего 12)
        'UPCE'     => '1234567',        // UPCE: 7 цифр
        'MSI'      => '12345',          // MSI: цифры, длина >= 1
        'MSI+'     => '12345',          // MSI+ с контрольной цифрой
        'POSTNET'  => '12345',          // POSTNET: 5, 9 или 11 цифр
        'PLANET'   => '12345',          // PLANET: 5, 9 или 11 цифр
        'RMS4CC'   => '12345678903',    // RMS4CC: 10 цифр + 1 контрольная (всего 11)
        'KIX'      => '123456789012',   // KIX: 12 цифр (почтовый код Нидерландов)
        'IMB'      => '01234567890123456789', // IMB: 20 символов (цифры и буквы)
        'CODABAR'  => 'A1234A',         // Codabar: начинается и заканчивается A-D, цифры между
        'CODE11'   => '12345',          // Code11: цифры и дефис, минимум 2 символа
        'PHARMA'   => '123456789012',   // Pharmacode: 6-12 цифр
        'PHARMA2T' => '123456789012',   // Pharmacode 2 track: 6-12 цифр
    ];

    $html = '<div style="font-family: monospace;">';

    $svgData = [];

    foreach ($barcodeExamples as $type => $code) {
        $svg = (new Milon\Barcode\DNS1D)->getBarcodeSVG($code, $type, h: 50, showCode: false);
        $html .= "<div style='margin-bottom:30px;'>";
        $html .= "$svg";
        $html .= "</div>";

        $svgData[$type] = $svg;
    }

    $html .= '</div>';

    // JS для скачивания SVG с задержкой 500 мс
    /*
    $html .= '

<script>
        const svgs = ' . json_encode($svgData) . ';
        const delay = 500;

        function downloadSVG(name, svgContent) {
            const blob = new Blob([svgContent], {type: "image/svg+xml"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = name + ".svg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        async function downloadAll() {
            for (const [name, svg] of Object.entries(svgs)) {
                downloadSVG(name, svg);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        // Запускаем сразу после загрузки страницы
        window.onload = () => {
            downloadAll();
        };
    </script>
    ';
    */

    return response($html)->header('Content-Type', 'text/html');
});
