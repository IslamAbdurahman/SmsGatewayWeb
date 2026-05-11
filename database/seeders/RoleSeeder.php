<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $clientRole = Role::firstOrCreate(['name' => 'Client']);

        // Agar hech qanday foydalanuvchi bo'lmasa yoki "admin@example.com" yo'q bo'lsa yaratish
        $adminUser = User::firstOrCreate(
            ['email' => 'abdurahmanislam304@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('12345678'),
            ]
        );

        // Admin rolini biriktirish
        if (!$adminUser->hasRole('Admin')) {
            $adminUser->assignRole($adminRole);
        }

        // Barcha mavjud foydalanuvchilarga Client rolini berish (Adminlardan tashqari)
        $users = User::doesntHave('roles')->get();
        foreach ($users as $user) {
            $user->assignRole($clientRole);
        }
    }
}
