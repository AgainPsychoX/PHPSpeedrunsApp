<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Seeder;

use App\Models\Game;
use App\Models\Category;
use App\Models\rUN;

class CategorySeeder extends Seeder
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
        Category::truncate();
        Schema::enableForeignKeyConstraints();

        $faker = \Faker\Factory::create();

        $gamesIds = Game::pluck('id')->toArray();

        $numberOfElements = $faker->numberBetween(2 * count($gamesIds), 4 * count($gamesIds));
        $this->command->comment("About to seed $numberOfElements categories using Faker...");

        for ($i = 0; $i < $numberOfElements; $i++) {
            $name = $faker->word();
            $j = $faker->numberBetween(1, $faker->numberBetween(0, 5));
            while ($j-- && strlen($name) < 48) $name .= ' ' . $faker->word();
            $name = ucfirst($name);
            $instance = Category::create([
                'game_id' => $faker->randomElement($gamesIds),
                'name' => $name,
                'rules' => $faker->randomDigit() == 0 ? '' : $faker->paragraph(),
                'score_rule' => $faker->randomElement(['none', 'none', 'none', 'high', 'high', 'high', 'high', 'low']),
            ]);
            $this->command->comment("created category named '$name'");
        }
    }
}
