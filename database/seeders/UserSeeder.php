<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\Run;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Run::truncate();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $faker = \Faker\Factory::create();
        $userFactory = User::factory();

        $userFactory->count($faker->numberBetween(10, 40))->ghost()->create();
        $userFactory->count($faker->numberBetween(10, 20))->create();
    }
}
