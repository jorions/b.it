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
        // Get user and post
        $user = \Auth::user();
        $post = App\Post::find($request->post_id);

        // Attach the post and user to each other in the post_user table using attach()
        $user->likes()->attach($post);

        // Get the user like
        $like = $user->likes()->where(['post_user.user_id' => $user->id, 'post_user.post_id' => $request->post_id])->get();

        // Return like
        return $like;
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {

        // Get user
        $user = \Auth::user();

        // Get user like
        $like = $user->likes()->where(['post_user.user_id' => $user->id, 'post_user.post_id' => $id])->get();

        // Check if the like is valid
        if($like != null) {

            // Raw database command to delete the entry
            \DB::delete('delete from post_user where user_id=? and post_id=?', array($user->id, $id));

            return $like;
        }

        return response('Unauthorized', 403);
    }
}
