<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\Run;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('run_verifications', function (Blueprint $table) {
			$table->foreignIdFor(Run::class)->constrained()->cascadeOnDelete();
			$table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
			$table->unique(['run_id', 'user_id']);
			$table->enum('vote', ['yes', 'abstain', 'no']);
			$table->text('note')->nullable();
			$table->timestamp('timestamp')->useCurrent();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('run_verifications');
	}
};
