<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App;

class PostsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return App\Post::all();
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $post = new App\Post;

        // Assign the post the current user's id
        $post->user_id = \Auth::user()->id;
        $post->post_content = $request->post_content;

        $post->save();

        return $post;
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return App\Post::with('user.likes')->find($id);
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
        $post = App\Post::find($id);

        // If current post's id matches current user's id, allow update
        if($post->user_id == \Auth::user()->id)
        {
            $post->post_content = $request->post_content;
            $post->save();
            return $post;
        }

        return response('Unauthorized', 403);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $post = App\Post::find($id);

        // If current post's id matches current user's id. allow delete
        if($post->user_id == \Auth::user()->id)
        {
            $post->delete();
            return $post;
        }

        return response('Unauthorized', 403);
    }

}
