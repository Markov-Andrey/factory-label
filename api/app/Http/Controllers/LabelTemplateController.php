<?php

namespace App\Http\Controllers;

use App\Services\TemplateService;
use Illuminate\Http\Request;

class LabelTemplateController extends Controller
{
    protected TemplateService $templates;

    public function __construct(TemplateService $templates)
    {
        $this->templates = $templates;
    }

    public function index()
    {
        return response()->json($this->templates->all());
    }

    public function tags()
    {
        return response()->json($this->templates->tags());
    }

    public function show($id)
    {
        return response()->json($this->templates->find($id));
    }

    public function store(Request $request)
    {
        $id = $this->templates->create($request->all());
        return response()->json(['id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $this->templates->update($id, $request->all());
        return response()->json(null, 204);
    }

    public function destroy($id)
    {
        $this->templates->delete($id);
        return response()->json(null, 204);
    }
}
