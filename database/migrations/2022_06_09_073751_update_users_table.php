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
            $table->string('name', 40)->unique()->change();
            $table->string('password')->nullable(true)->change();

            $table->string('country_id', 3)->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('twitch_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('discord', 40)->nullable();
            $table->text('profile_description')->default('');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('name');
            $table->string('name')->change();
            $table->string('password')->nullable(false)->change();

            $table->dropColumn([
                'country_id',
                'youtube_url',
                'twitch_url',
                'twitter_url',
                'discord',
                'profile_description',
            ]);
        });
    }
};
