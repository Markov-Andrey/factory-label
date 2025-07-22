<?php

namespace App\Http\Controllers;

use App\Services\LabelerGenerator;
use App\Services\LabelerJobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelJobController extends Controller
{
    public function process(Request $request): JsonResponse
    {
        $data = $request->all();
        try {
            $result = LabelerGenerator::preview($data);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при генерации предпросмотра',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function upload(Request $request): JsonResponse
    {
        $data = $request->all();
        try {
            $result = LabelerGenerator::upload($data);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при генерации предпросмотра',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function status($jobId): JsonResponse
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

