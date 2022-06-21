<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\User;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('moderator_assignments', function (Blueprint $table) {
			$table->dropForeign(['user_id']);
			$table->dropColumn(['user_id']);
		});
		Schema::table('moderator_assignments', function (Blueprint $table) {
			$table->foreignIdFor(User::class)->first()->constrained()->cascadeOnDelete();

			$table->foreignIdFor(User::class, 'revoked_by')->after('assigned_at')->nullable()->constrained('users');

			$table->index('target_id');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('moderator_assignments', function (Blueprint $table) {
			$table->dropForeign(['user_id']);
			$table->dropColumn(['user_id']);
		});
		Schema::table('moderator_assignments', function (Blueprint $table) {
			$table->foreignIdFor(User::class)->first()->constrained();

			$table->dropForeign(['revoked_by']);
			$table->dropColumn(['revoked_by']);

			$table->dropIndex('target_id');
		});
	}
};
