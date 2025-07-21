<?php

namespace App\Http\Controllers;

use App\Services\LabelerJobService;
use Illuminate\Http\Request;

class PreviewController extends Controller
{
    public function preview(Request $request)
    {
        $data = $request->all();
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
    public function upload(Request $request)
    {
        $data = $request->all();
        try {
            $result = (new \App\Services\LabelerGenerator)->upload($data);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при генерации предпросмотра',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function status($jobId)
    {
        try {
            $result = LabelerJobService::getStatus((int)$jobId);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при обновлении статуса',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

