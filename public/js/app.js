/**
 * Created by jared on 3/26/16.
 */
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});




var PostModel = Backbone.Model.extend({
    urlRoot: '/api/posts/',
    idAttribute: 'id'
});


var UserModel = Backbone.Model.extend({
    urlRoot: '/api/users/',
    idAttribute: 'id',
    
    // For /api/users/, when a response with "currentUser=true" is passed into the route, the route returns both a user
    // and all of its likes
    parse: function(response) {
        // If the current user has likes, turn that list of likes into a PostsCollection
        if(response.likes) {
            response.likes = new PostsCollection(response.likes);
        }
        return response;
    }
});

var PostsCollection = Backbone.Collection.extend({
    url: '/api/posts/',
    model: PostModel
});




var PostsListView = Backbone.View.extend({
    el: '<div class="post-container"></div>',

    // Gets 'posts' as a parameter from render()
    template: _.template('\
        <% posts.each(function(post) { %>\
            <a class="post" href="#" data-user-id="<%= post.get("user_id") %>">\
                <div class="post" data-user-id="<%= post.get("user_id") %>">\
                    <%= post.get("post_content") %>\
                </div>\
            </a>\
        <% }) %>\
    '),

    // initialize: function () {
    //     this.listenTo(this.collection, 'add', this.render);
    // },

    events: {
        'click .post': function(event) {
            
            // If the clicked link is invalid nothing happens
            event.preventDefault();

            var clickedUser = new UserModel({ id: $(event.target).data('user-id') });
            clickedUser.fetch({
                success: function() {
                    var posts = new PostsCollection(clickedUser.get('posts'));
                    posts.fetch();
                    var usersPostsListView = new PostsListView({
                        collection: posts
                    });
                    $('#main-window').html(usersPostsListView.render().el);
                    var mainTitle = "posts by " + clickedUser.get('name');
                    $('#main-title').html(mainTitle);
                }
            });
        }
    },

    // Gets 'collection' from HomeView's render(), which instantiates postListView with 'collection' as a parameter
    // This method automatically runs whenever its class is instantiated
    // initialize: function() {
    //     this.listenTo(this.collection, 'update', this.render);
    // },

    // Gets 'collection' from HomeView's render(), which instantiates postListView with 'collection' as a parameter
    render: function() {
        this.$el.html(this.template({ posts: this.collection }));
        return this;
    }
});



var HomeView = Backbone.View.extend({
    el: '\
        <div class="container">\
            <div class="row">\
                <div class="four columns">\
                    <div class="row">\
                        <div class="twelve columns" id="content-container">\
                            <div class="title">all posts</div>\
                            <div id="all-posts"></div>\
                        </div>\
                    </div>\
                    <div class="row">\
                        <div class="twelve columns" id="content-container">\
                            <div class="title">create a post</div>\
                            <div id="post-form">\
                                <input type="text" id="new-post" name="new-post" placeholder="enter post" />\
                                <input type="button" id="submit" value="submit" />\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="eight columns" id="content-container">\
                    <div class="title" id="main-title"></div>\
                    <div id="main-window"></div>\
                </div>\
            </div>\
        </div>\
    ',

    // Initialize a UserModel and then fetch it with the response "currentUser=true", which will trigger the UserController's
    // index() to return the current user with all of their likes
    initialize: function() {
        this.user = new UserModel();

        this.user.fetch({
            data: {
                currentUser: true
            }
        });

        // Listen to syncs on this.user. fetch() is asynchronous, so it won't run when it is first called, it will run
        // after everything else that isn't asynchronous has run. So when we fetch above it is actually just making
        // this.user into an empty shell. So if we were to just try to render the user's likes in the render() below, it
        // wouldn't work. Instead we need to have a function that adds the likes to the el that runs whenever this.user
        // syncs, and this.user syncs once it successfully runs fetch()
        this.listenTo(this.user, 'sync', this.insertLikes);
    },

    events: {
        "click #submit": "createPost"
    },

    render: function() {
        this.insertAllPosts();

        return this;
    },

    insertAllPosts: function() {
        var posts = new PostsCollection();
        var that = this;

        posts.fetch({
            success: function() {
                var postsListView = new PostsListView({ collection: posts });
                // Make sure to say postsListView.render().el instead of postsListView.el so that the view actually renders
                that.$el.find('#all-posts').html(postsListView.render().el);
            }
        });
    },

    insertLikes: function() {
        // We passed the PostsListView the collection of this.user.get('likes') so that the collection the view renders is
        // the collection of 'likes' that we got from this.user
        var postsListView = new PostsListView({ collection: this.user.get('likes') });
        this.$el.find('#main-window').html(postsListView.render().el);
        this.$el.find('#main-title').html('your favorited posts');
    },

    createPost: function() {

        //var postContent = $('#new-post').value;

        // Get the value of the text input
        var postContent = document.getElementsByName('new-post')[0].value;

        // If the input is empty, tell the user with an alert
        if(postContent === "") {

            alert("please enter a post");

        // Otherwise, create a new post, save it to the backend, re-render the posts to update the list, then clear
        // the text field
        } else {
            var newPost = new PostModel();
            newPost.set({
                post_content: postContent
            });

            newPost.save();

            this.insertAllPosts();

            this.$el.find('#new-post').val("");
        }
    }
});



var homeView = new HomeView();
$('#content').html(homeView.render().el);

// QUESTIONS
// WHY ARE MY REQUESTS SHOWING UP TWICE?
// HOW TO GET NAMES TO SHOW UP NEXT TO EACH POST?
// IS THERE A BETTER WAY TO ADD A NEWLY CREATED POST TO THE LIST BESIDES CALLING THIS.INSERTALLPOSTS()? LIKE APPENDING
//   ONLY THE NEW POST ( this.$el.find('#all-posts').append(newPost) )