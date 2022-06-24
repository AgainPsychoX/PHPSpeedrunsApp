<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ConvertRequestFieldsToCamelCase
{
	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
	 * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
	 */
	public function handle($request, Closure $next)
	{
		$replaced = [];
		foreach ($request->all() as $key => $value) {
			if (!$request->hasFile($key)) {
				$replaced[Str::snake($key)] = $value;
			}
		}
		$request->replace($replaced);

		return $next($request);
	}
}
