<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create 50 users
        factory(App\User::class, 50)->create()->each(function($user) {

            // Each user creates 5 posts
            for($i=0; $i<5; $i++) {
                $user->posts()->save(factory(App\Post::class)->make());
            }

            // Each user favorites 2 posts
            for($i=0; $i<2; $i++)
            {
                // Store a random post_id
                $temp = rand(1, App\Post::all()->count());

                // If the loop has not run before assign a value to lastTemp, which will be used to prevent the user from
                // liking the same post twice
                if($i == 0)
                {
                    $lastTemp = 0;
                }

                // To prevent liking the same post twice, keep generating a new post_id until a new post_id is generated
                if($temp == $lastTemp)
                {
                    $temp = rand(1, App\Post::all()->count());
                }

                // Now that the new, non-duplicate post has been generated, 'like' the post
                $user->likes()->attach($temp);

                // Store the post_id to be rechecked in case the loop runs again
                $lastTemp = $temp;
            }

        });
    }
}
