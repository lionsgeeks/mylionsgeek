<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSchoolNetworkRequest;
use App\Support\SchoolAllowedIps;
use Inertia\Inertia;
use Inertia\Response;

class SchoolNetworkController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/school-network/index', [
            'schoolNetwork' => [
                'ips' => SchoolAllowedIps::formIps(),
                'source' => SchoolAllowedIps::source(),
                'activeIps' => SchoolAllowedIps::resolve(),
            ],
        ]);
    }

    public function update(UpdateSchoolNetworkRequest $request)
    {
        SchoolAllowedIps::store($request->validated('ips'));

        return back()->with('success', 'School network IPs saved.');
    }
}
