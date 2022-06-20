<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Speedruns app</title>
		<link href="{{ asset('css/app.css') }}" rel="stylesheet">
		<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"/>
		<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png"/>
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
	</head>
	<body>
		<div id="app"></div>
		<script src="{{ asset('js/main.js') }}"></script>
	</body>
</html>
