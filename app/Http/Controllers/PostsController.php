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
        // Return all posts with their user attached, sorted in descending order of post date
        return App\Post::with('user')->orderBy('updated_at', 'desc')->get();
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

        // Assign the post the current user's id and the content from the $request
        $post->user_id = \Auth::user()->id;
        $post->post_content = $request->post_content;

        // Save the $post to the database
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
        // Return the post of a given $id with its user and that user's posts attached
        return App\Post::with('user.posts')->find($id);
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
        
        // Get the post with the given $id
        $post = App\Post::find($id);

        // If current post's id matches current user's id, allow update, otherwise redirect to a 403 page
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
        // Get the post with the given $id
        $post = App\Post::find($id);

        // If current post's user_id matches current user's id, allow delete. Otherwise redirect to a 403 page
        if($post->user_id == \Auth::user()->id)
        {
            $post->delete();
            return $post;
        }

        return response('Unauthorized', 403);
    }

}
