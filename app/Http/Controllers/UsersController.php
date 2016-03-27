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
    public function index()
    {
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
        $user = App\User::find($id);

        if ($user->id == \Auth::user()->id) {
            $user->name = $request->name;
            $user->email = $request->email;

            // ?? IS THERE A DIFFERENT WAY TO STORE THIS GIVEN THAT WE SHOULD HASH THE DATA??
            $user->password = $request->password;

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
        $user = App\User::find($id);

        if ($user->id == \Auth::user()->id) {

            $user->delete();

            return $user;
        }

        return response("Unauthorized", 403);
    }
}
