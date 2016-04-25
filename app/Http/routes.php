<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// Everything in this group has access to the CSRF Token (web middleware has access to this, as shown in Kernel.php)
Route::group(['middleware' => 'web'], function () {
    Route::auth();

    Route::get('/home', 'HomeController@index');

    Route::get('/', function () {
        return view('welcome');
    });

    // Everything in this group will have a url that starts with '/api'
    Route::group(['prefix' => 'api'], function() {

        Route::resource('users', 'UsersController', [
            'only' => ['index', 'show']
        ]);

        Route::resource('posts', 'PostsController', [
            'only' => ['index', 'show']
        ]);

        // Everything in this group will only be accessible once logged in
        Route::group(['middleware' => 'auth'], function() {

            // No store function for users because that feature is prebuilt
            Route::resource('users', 'UsersController', [
                'only' => ['update', 'destroy']
            ]);

            Route::resource('posts', 'PostsController', [
                'only' => ['store', 'update', 'destroy']
            ]);

            Route::resource('postuser', 'PostUserController', [
                'only' => ['store', 'destroy']
            ]);
        });
    });
});
