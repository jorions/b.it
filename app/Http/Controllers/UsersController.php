<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // If a request is not passed into the route with "currentUser=true", then just show all users. Otherwise return
        // only the current user with all of their likes
        if ($request->currentUser) {

            // first() is used because where() returns an array, and in the array is just the 1 user, so this pulls out the
            // first user as just an object
            return App\User::where('id', \Auth::user()->id)->with('likes.user')->first();
        }

        return App\User::all();
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Return a user of a given $id with all of their posts attached
        return App\User::with('posts')->find($id);
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Create a user based on the given $id
        $user = App\User::find($id);

        // Validate that the given $id matches the current user's id. If it is invalid send the user to a 403 page
        if ($user->id == \Auth::user()->id) {

            // Update the user's profile accordingly if there is a match
            $user->name = $request->name;
            $user->email = $request->email;

            // Save to the database
            $user->save();

            return $user;
        }

        return response("Unauthorized", 403);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        // Create a user based on the given $id
        $user = App\User::find($id);

        // Validate that the given $id matches the current user's id. If it is invalid send the user to a 403 page
        if ($user->id == \Auth::user()->id) {

            // Remove the user from the database
            $user->delete();

            return $user;
        }

        return response("Unauthorized", 403);
    }
}
