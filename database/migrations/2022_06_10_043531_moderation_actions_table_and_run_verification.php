c<?php

use App\Models\Category;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\Run;
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
        Schema::table('categories', function (Blueprint $table) {
            $table->smallInteger('verification_requirement')->default(1);
        });

        Schema::table('runs', function (Blueprint $table) {
            $table->enum('state', ['pending', 'verified', 'invalid']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'verification_requirement',
            ]);
        });

        Schema::table('runs', function (Blueprint $table) {
            $table->dropColumn([
                'state',
            ]);
        });
    }
};
