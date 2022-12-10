<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

use App\Models\Game;
use App\Models\Category;
use App\Models\Run;

class GameSeeder extends Seeder
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
		Game::truncate();
		Schema::enableForeignKeyConstraints();
		// if (Storage::exists('public/images/games')) {
		//     Storage::deleteDirectory('public/images/games');
		// }
		// Storage::makeDirectory('public/images/games');

		$faker = \Faker\Factory::create();
		$faker->addProvider(new \Mmo\Faker\PicsumProvider($faker));

		$numberOfElements = $faker->numberBetween(10, 20);
		$this->command->comment("About to seed $numberOfElements games using Faker...");

		for ($i = 0; $i < $numberOfElements; $i++) {
			$width = $faker->randomElement([240, 300, 320, 360, 400, 420, 440, 450, 480, 500, 540, 600, 640, 720]);
			$height = round($width * $faker->randomFloat(1, 0.8, 1.2), -1);
			$iconType = $faker->randomElement(['jpeg', 'jpeg', 'jpeg', 'webp', null]);
			if (!is_null($iconType)) {
				$tempImagePath = $faker->picsum(null, $width, $height, imageExtension: $iconType == 'jpeg' ? 'jpg' : $iconType);
			}
			$name = $faker->word();
			$j = $faker->randomDigit() < 3 ? 0 : $faker->numberBetween(0, $faker->numberBetween(0, 7));
			while ($j-- && strlen($name) < 48) $name .= ' ' . $faker->word();
			$name = ucfirst($name);
			$instance = Game::create([
				'name' => $name,
				'description' => $faker->randomDigit() == 0 ? '' : $faker->paragraph(),
				'rules' => $faker->randomDigit() == 0 ? '' : $faker->paragraph(),
				'icon' => $iconType,
				'publish_year' => $faker->numberBetween(1988, 2022),
			]);
			$this->command->comment("created game named '$name'");
			if (!is_null($iconType)) {
				$directory = 'public/images/games/' . $instance->id;
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
