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

        // if (Storage::exists('public/images/categories')) {
        //     Storage::deleteDirectory('public/images/categories');
        // }
        // Storage::makeDirectory('public/images/categories');

        $faker = \Faker\Factory::create();
        $faker->addProvider(new \Mmo\Faker\PicsumProvider($faker));

        $gamesIds = Game::pluck('id')->toArray();

        $numberOfElements = $faker->numberBetween(2 * count($gamesIds), 4 * count($gamesIds));
        $this->command->comment("About to seed $numberOfElements categories using Faker...");

        for ($i = 0; $i < $numberOfElements; $i++) {
            $width = $faker->randomElement([240, 300, 320, 360, 400, 420, 440, 450, 480, 500, 540, 600, 640, 720]);
            $height = round($width * $faker->randomFloat(1, 0.8, 1.2), -1);
            $iconType = $faker->randomElement(['jpeg', 'jpeg', 'jpeg', 'webp', null]);
            if (!is_null($iconType)) {
                $tempImagePath = $faker->picsum(null, $width, $height, imageExtension: $iconType == 'jpeg' ? 'jpg' : $iconType);
            }
            $name = $faker->word();
            $j = $faker->numberBetween(1, $faker->numberBetween(0, 5));
            while ($j-- && strlen($name) < 48) $name .= ' ' . $faker->word();
            $name = ucfirst($name);
            $instance = Category::create([
                'game_id' => $faker->randomElement($gamesIds),
                'name' => $name,
                'rules' => $faker->randomDigit() == 0 ? '' : $faker->paragraph(),
                'icon' => $iconType,
                'score_rule' => $faker->randomElement(['none', 'none', 'none', 'high', 'high', 'high', 'high', 'low']),
            ]);
            $this->command->comment("created category named '$name'");
            if (!is_null($iconType)) {
                $directory = 'public/images/categories/' . $instance->id;
                if (Storage::exists($directory)) {
                    Storage::deleteDirectory($directory);
                }
                if (!Storage::exists($directory)) {
                    Storage::makeDirectory($directory);
                }
                File::move($tempImagePath, Storage::path(sprintf('%s/icon.%s', $directory, $iconType)));
            }
        }
    }
}
