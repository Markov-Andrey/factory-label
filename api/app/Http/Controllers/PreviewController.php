<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreviewController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->all();

        if (isset($data['data']['data']) && is_array($data['data']['data']) && count($data['data']['data']) > 0) {
            $data['data']['data'] = $data['data']['data'][0];
        }

        try {
            $result = (new \App\Services\LabelerGenerator)->preview($data);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при генерации предпросмотра',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

