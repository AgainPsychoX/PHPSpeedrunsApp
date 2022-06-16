<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests\StoreRunRequest;
use App\Http\Requests\UpdateRunRequest;
use App\Http\Resources\RunResource;
use App\Http\Resources\RunCollection;
use App\Models\Run;

class RunController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
		// TODO: implement (`?player=1`)
		return response()->json([
			"message" => "Not implemented yet",
		], 501);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreRunRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRunRequest $request)
    {
        return new RunResource(Run::create($request->all()));
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Run  $run
     * @return \Illuminate\Http\Response
     */
    public function show(Run $run)
    {
        return new RunResource($run);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateRunRequest  $request
     * @param  \App\Models\Run  $run
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRunRequest $request, Run $run)
    {
        $run->update($request->all());
        $run = $run->refresh();
        return new RunResource($run);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Run  $run
     * @return \Illuminate\Http\Response
     */
    public function destroy(Run $run)
    {
        $count = $run->runs()->count();
        if ($count == 0) {
            $run->delete();
            return response()->noContent();
        }
        else {
            return response()->json([
                "message" => "There are runs associated with this Run. You need either delete or move those first.",
                "count" => $count,
            ], 409);
        }
    }
}
