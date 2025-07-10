<?php

namespace App\Http\Controllers;


use App\Services\GS1DataMatrixTemplateService;
use Illuminate\Http\Request;

class Gs1DataMarkController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $codes = $request->input('codes');
        if (!$codes || !is_array($codes)) {
            return response()->json(['message' => 'Error', 'code' => '202']);
        }
        $dataGs1 = array_map(function ($code) {
            $svg = GS1DataMatrixTemplateService::template1($code);
            return base64_encode($svg);
        }, $codes);

        return response()->json(['data' => $dataGs1]);
    }
}
