<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    private function fakerNickname() {
        $str = '';
        $str .= $this->faker->randomDigit < 7 ? ucfirst($this->faker->word()) : $this->faker->word();
        if ($this->faker->randomDigit() < 7 || strlen($str) < 3) {
            $str .= $this->faker->randomDigit < 7 ? ucfirst($this->faker->word()) : $this->faker->word();
        }
        if ($this->faker->randomDigit() < 7) {
            $str .= $this->faker->numberBetween(0, 2020);
        }
        return $str;
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => $this->fakerNickname(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     *
     * @return static
     */
    public function unverified()
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }

    /**
     * Indicate that the model is not real user account, but 'ghost' profile of player.
     */
    public function ghost() {
        return $this->state(function (array $attributes) {
            return [
                'password' => null,
            ];
        });
    }
}
