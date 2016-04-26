<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App;

class PostUserController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = \Auth::user();
        $post = App\Post::find($request->post_id);

        // Attach the post and user to eachother in the post_user table using attach()
        $user->likes()->attach($post);

    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {

        $user = \Auth::user();
        $like = $user->likes()->where(['post_user.user_id' => \Auth::user()->id, 'post_user.post_id' => $id])->get();

//        $user->likes()->detach($like->id);
//        $like->delete();

        \DB::delete('delete from post_user where user_id=? and post_id=?', array($user->id, $id));

        return $like;
    }
}
