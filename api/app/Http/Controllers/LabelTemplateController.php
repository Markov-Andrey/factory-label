<?php

namespace App\Http\Controllers;

use App\Services\TemplateService;
use Illuminate\Http\Request;

class LabelTemplateController extends Controller
{
    public function index()
    {
        return response()->json(TemplateService::all());
    }

    public function tags()
    {
        return response()->json(TemplateService::tags());
    }

    public function show($id)
    {
        return response()->json(TemplateService::find($id));
    }

    public function store(Request $request)
    {
        $id = TemplateService::create($request->all());
        return response()->json(['id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        TemplateService::update($id, $request->all());
        return response()->json(null, 204);
    }

    public function destroy($id)
    {
        TemplateService::delete($id);
        return response()->json(null, 204);
    }
}
