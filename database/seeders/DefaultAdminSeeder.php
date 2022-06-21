<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\ModeratorAssignment;

class DefaultAdminSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$userFactory = User::factory();

		$defaultGlobalAdmin = $userFactory->create([
			'name' => 'admin',
		]);
		ModeratorAssignment::create([
			'user_id' => $defaultGlobalAdmin->id,
			'target_type' => 'global',
			'assigned_by' => $defaultGlobalAdmin->id,
		]);
	}
}
