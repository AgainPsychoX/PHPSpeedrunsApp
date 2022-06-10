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
        Schema::create('moderator_assignments', function (Blueprint $table) {
            $table->foreignIdFor(User::class)->constrained();
            $table->foreignId('target_id')->nullable();
            $table->enum('target_type', ['global', 'game', 'category']);
            $table->foreignIdFor(User::class, 'assigned_by')->constrained('users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('revoked_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('moderator_assignments');
    }
};
