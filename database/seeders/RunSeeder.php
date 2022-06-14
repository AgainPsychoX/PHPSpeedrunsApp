<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\Run;
use App\Models\Category;

class RunSeeder extends Seeder
{
    /**
     * Predefined random video URLs because there would be no way to generate those reliably without web scrapping/spider.
     */
    private const videoUrls = array(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=dUW_huYo4cM',
    );

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Run::truncate();
        Schema::enableForeignKeyConstraints();

        $faker = \Faker\Factory::create();

        foreach (Category::with('game')->get() as $category) {
            $name = $category->game->name . ', ' . $category->name;
            if ($faker->randomDigit() == 0) {
                continue; // some categories should be empty
            }

            $usersIds = $faker->randomElements(User::pluck('id')->toArray(), $faker->numberBetween(2, 8));

            $count = $faker->numberBetween($faker->numberBetween(2, 5), $faker->numberBetween(10, 40));
            $this->command->comment("creating $count runs for '$name' using Faker...");

            $durationMinimum = $faker->numberBetween(47 * 1000, 4 * 60 * 60 * 1000);
            $durationRandomSpan = $faker->numberBetween(round($durationMinimum / 100), $durationMinimum);

            if ($faker->randomDigit() < 3) {
                $scoreBase = 0;
            }
            else {
                $scoreBase = $faker->randomNumber(round($faker->randomDigit() + 1) / 2);
            }
            if ($category->score_rule == 'high') {
                $scoreRandomSpan = $faker->numberBetween(round($scoreBase / $faker->numberBetween(2, 50)), ($scoreBase + 1) * $faker->numberBetween(1, 5));
            }
            else if ($category->score_rule == 'low') {
                $scoreRandomSpan = $faker->numberBetween(round($scoreBase / 100), ($scoreBase + 1) * 4);
                $scoreBase += $scoreRandomSpan;
            }

            for ($i = 0; $i < $count; $i++) {
                $durationFloaty = mt_rand() / mt_getrandmax();
                $durationFloaty *= $durationFloaty;
                if ($faker->randomDigit() < 3) $durationFloaty *= $durationFloaty;

                $scoreFloaty = mt_rand() / mt_getrandmax();
                if ($faker->randomDigit() < 7) $scoreFloaty *= $scoreFloaty;
                if ($faker->randomDigit() < 3) $scoreFloaty *= $scoreFloaty;

                $instance = Run::create([
                    'category_id' => $category->id,
                    'user_id' => $faker->randomElement($usersIds),
                    'duration' => $durationMinimum + round($durationFloaty * $durationRandomSpan),
                    'score' => $category->score_rule == 'none' ? 0 : (
                        $category->score_rule == 'high' ?
                            round($scoreBase + $scoreFloaty * $scoreRandomSpan)
                        :
                            round($scoreBase - $scoreFloaty * $scoreRandomSpan)
                    ),
                    'video_url' => $faker->randomElement(RunSeeder::videoUrls),
                    'notes' => $faker->paragraph($faker->numberBetween(1, 5)),
                    'state' => $faker->randomElement(['pending', 'pending', 'verified', 'verified', 'verified', 'verified', 'verified', 'invalid']),
                ]);
                $this->command->comment("created run");
            }
        }

    }
}
