<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('users', function (Blueprint $table) {
			$table->text('profile_description')->nullable(true)->change();
		});
		Schema::table('games', function (Blueprint $table) {
			$table->text('description')->nullable(true)->change();
			$table->text('rules')->nullable(true)->change();
		});
		Schema::table('categories', function (Blueprint $table) {
			$table->text('rules')->nullable(true)->change();
		});
		Schema::table('runs', function (Blueprint $table) {
			$table->text('notes')->nullable(true)->change();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		// No breaking changes if going down.
	}
};
