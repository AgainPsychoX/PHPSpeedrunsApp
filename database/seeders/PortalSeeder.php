<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

use App\Models\User;
use App\Models\Run;
use App\Models\Category;
use App\Models\Game;
use App\Models\ModeratorAssignment;

class PortalSeeder extends Seeder
{
	const GLOBAL_MODS_NAMES = ['Shizzal', 'Crisper'];
	const GAME_MODS_NAMES = ['Imanex', 'Em0nky', 'adamantite', 'Reassagressta'];
	const CATEGORY_MODS_NAMES = ['FabiClawZ', 'cosine', 'inflame', 'clairevoyance', 'Valoix', 'calamity_', 'RealCreative', 'hikLye', 'edss'];

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$faker = \Faker\Factory::create();

		// Remove if already exist
		Schema::disableForeignKeyConstraints();
		{
			$game = Game::where('name', 'Portal')->first();
			if ($game) {
				$this->command->comment("deleting Portal mods");
				foreach (self::GLOBAL_MODS_NAMES as $name) {
					$user = User::where('name', $name)->first();
					if ($user) $user->delete();
				}
				foreach (self::GAME_MODS_NAMES as $name) {
					$user = User::where('name', $name)->first();
					if ($user) $user->delete();
				}
				foreach (self::CATEGORY_MODS_NAMES as $name) {
					$user = User::where('name', $name)->first();
					if ($user) $user->delete();
				}
				$playerIdsToBeRemoved = collect();
				foreach ($game->categories()->lazy() as $category) {
					$this->command->comment("deleting category '".$category->name."' with ".$category->runs()->count()." runs");
					foreach ($category->runs()->lazy() as $run) {
						$playerIdsToBeRemoved->push($run->user_id);
						$run->delete();
					}
					$category->delete();
				}
				foreach ($playerIdsToBeRemoved->unique() as $userId) {
					$user = User::find($userId);
					if (!$user) continue;
					if ($user->runs()->count() == 0 && $user->name != 'admin') {
						$this->command->comment("deleting user '".$user->name."'");
						$user->delete();
					}
				}
				$game->delete();
				$this->command->comment("deleted Portal game");
			}
		}
		Schema::enableForeignKeyConstraints();

		////////////////////////////////////////
		// Create the game

		$iconType = 'png';
		$game = Game::create([
			'name' => 'Portal',
			'description' => <<<EOF
Logiczno-platformowa gra komputerowa ukazana z perspektywy pierwszej osoby, wyprodukowana i wydana w 2007 roku przez Valve Corporation.\n\nGra opiera się na wykorzystywaniu Aperture Science Handheld Portal Device, podręcznego urządzenia, które tworzy portale na białych powierzchniach, pozwalając na swobodne podróżowanie oraz interakcję pomiędzy dowolnymi dwiema lokacjami w przestrzeni trójwymiarowej. Portale tworzyć można jedynie na płaskich powierzchniach. Jeśli portale zostaną stworzone na różnych płaszczyznach, powstaną wahania geometrii i grawitacji, na przykład przechodząc przez portal na ścianie prowadzący do portalu na ziemi, przechodzący zostanie odepchnięty przez grawitację ziemi przed portal na ścianie. Jednocześnie mogą być tworzone tylko dwa portale, tak więc przy stworzeniu nowego portalu, wcześniej powstały portal znika.
EOF ,
			'rules' => <<<EOF
Ukończ grę bez skryptów, makr i kodów. Należy to zrobić za jednym posiedzeniem, dozwolone są szybkie zapisy i wczytywanie. W przypadku uruchamiania Portalu używany jest Source Unpack. Czas zaczyna się, gdy pojawia się celownik, a kończy, gdy znika po śmierci Glados. Jest on określany na podstawie czasu w grze. LiveSplit jest wysoce zalecany ze względu na automatyczne uruchamianie/zatrzymywanie i usuwanie obciążenia. Wszystkie uruchomienia wykorzystujące czas w grze muszą korzystać z najnowszej wersji SourceSplit. W przypadku podejrzeń moderatorzy mogą zażądać wersji demonstracyjnych. Filmy muszą pokazywać pełny przebieg od początku do końca.

Dozwolone są komendy/powiązania klawiszy dostępne z menu. Wszelkie zmiany tekstur ścian lub podłóg są niedozwolone. Inne zmiany tekstur i plików dźwiękowych są dozwolone, o ile nie dają przewagi. Dozwolone są zmiany kosmetyczne i rozmiaru czcionek w pliku „SourceScheme.res”. Wielokrotne zapisywanie i wczytywanie w celu celowego postępu gry bez przesuwania stopera jest niedozwolone,
EOF ,
			'icon' => $iconType,
			'publish_year' => 2007,
		]);

		$tempImagePath = \Mmo\Faker\DownloaderHelper::fetchImage("https://www.speedrun.com/gameasset/4pd0n31e/cover?v=1d3445a");
		$directory = 'public/images/games/'.$game->id;
		if (Storage::exists($directory)) {
			Storage::deleteDirectory($directory);
		}
		if (!Storage::exists($directory)) {
			Storage::makeDirectory($directory);
		}
		File::move($tempImagePath, Storage::path(sprintf('%s/icon.%s', $directory, $iconType)));
		$this->command->comment("created Portal game");

		////////////////////////////////////////
		// Create categories

		// Example category
		$glitchlessCategory = Category::create([
			'game_id' => $game->id,
			'name' => 'Glitchless',
			'rules' => <<<EOF
Beat the game, using none of the glitches listed below.

Banned glitches include, but are not limited to:

Any method of going OoB/placing portals OoB, as defined in the Inbounds rules
Any form of Save Load Abuse, as defined in the Inbounds No SLA rules
Turret killed Glados
ABH, AFH, ASH
Item Climbing or gaining/preserving height from a mid-air prop
Camera Fly
Super Object Throw
Quantum Crouch
Portal Bumping through objects or entities
Edge Glitch
Clipping Glitch
LAG, AAG, VAG
Portal Under Door in 09
Prop and Portal Boosts (accidental boosts are allowed as long as they do not advance you further than possible without glitches)
Shooting under door at the start of 16
11 platform shot
Item Save Glitch
Planetary Alignment
If you are unsure about whether something is allowed or not, message a mod or ask in the discord.
EOF ,
			'score_rule' => 'none',
		]);
		$this->command->comment("created main Portal category: 'Glitchless'");

		// Other categories
		foreach (["Out of bounds", "Inbounds", "Inbounds No SLA"] as $name) {
			$category = Category::create([
				'game_id' => $game->id,
				'name' => $name,
				'rules' => $faker->paragraph(),
				'score_rule' => 'none',
			]);
			$this->command->comment("created misc Portal category: '$name'");
		}

		////////////////////////////////////////
		// Create mods

		$userFactory = User::factory();
		$mainGlobalAdmin = User::where('name', 'admin')->first();

		$globalMods = array_map(function(string $name) use(&$userFactory) {
			$user = $userFactory->create([ 'name' => $name ]);ModeratorAssignment::create([
				'user_id' => $user->id,
				'target_type' => 'global',
				'assigned_by' => $mainGlobalAdmin ?? $user->id,
			]);
			return $user;
		}, self::GLOBAL_MODS_NAMES);
		$gameMods = array_map(function(string $name) use(&$userFactory, &$game, &$globalMods, &$faker) {
			$user = $userFactory->create([ 'name' => $name ]);
			ModeratorAssignment::create([
				'user_id' => $user->id,
				'target_type' => 'game',
				'target_id' => $game->id,
				'assigned_by' => $faker->randomElement($globalMods)->id,
			]);
			return $user;
		}, self::GAME_MODS_NAMES);
		$categoryMods = array_map(function(string $name) use(&$userFactory, &$glitchlessCategory, &$gameMods, &$faker) {
			$user = $userFactory->create([ 'name' => $name ]);
			ModeratorAssignment::create([
				'user_id' => $user->id,
				'target_type' => 'category',
				'target_id' => $glitchlessCategory->id,
				'assigned_by' => $faker->randomElement($gameMods)->id,
			]);
			return $user;
		}, self::CATEGORY_MODS_NAMES);
		$this->command->comment("created Portal mods");

		////////////////////////////////////////
		// Import some runs for main category

		$json = json_decode(file_get_contents(__DIR__ . "/portal_glitchless_prepared.json"), true);

		$playerNameToId = [];
		foreach ($json["players"] as $name) {
			$isMod = in_array($name, self::GLOBAL_MODS_NAMES) || in_array($name, self::GAME_MODS_NAMES) || in_array($name, self::CATEGORY_MODS_NAMES);
			$user = User::where('name', $name)->first();
			if (!$isMod) {
				if ($user)
					$user->delete();

				if ($faker->randomDigit() < 3)
					$user = $userFactory->create([ 'name' => $name ]);
				else
					$user = $userFactory->ghost()->create([ 'name' => $name ]);
			}

			$playerNameToId[$name] = $user->id;
		}
		$this->command->comment("created ".count($json["players"])." players");

		foreach ($json["runs"] as $data) {
			$run = new Run();
			$run->category_id = $glitchlessCategory->id;
			$run->user_id = $playerNameToId[$data['player']];
			$run->duration = $data['duration'];
			$run->video_url = $data['video'];
			$run->notes = $data['notes'];
			$run->state = 'verified';
			$run->updated_at = $run->created_at = Carbon::createFromTimestamp($data['createdAt']);
			$run->save(['timestamps' => false]);
		}
		$this->command->comment("created ".count($json["runs"])." runs");

		$firstPlayer = User::where('name', 'SiDiouS')->firstOrFail();
		$firstPlayer->password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password
		$firstPlayer->country_id = 'GBR';
		$firstPlayer->youtube_url = 'https://www.youtube.com/channel/UCSb2Maf5uj-Gp7d4Wbv4IGw';
		$firstPlayer->twitch_url = 'https://www.twitch.tv/sidsusballs';
		$firstPlayer->discord = 'SiDiouS#6946';
		$firstPlayer->profile_description = <<<EOF
Hello, I'm SiDiouS. Welcome to my profile!

I mainly run Portal games. I dedicated 5000+ hours to keep my first place :)
EOF;
		$firstPlayer->save();
		$this->command->comment("updated 'SiDiouS' user with details");
	}
}
