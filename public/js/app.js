$(function() {


    // Insert the csrf token for security verification
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // The model to hold posts
    var PostModel = Backbone.Model.extend({
        urlRoot: '/api/posts',
        idAttribute: 'id'
    });

    // The model to hold users (used for getting likes and for seeing all posts by a given users)
    var UserModel = Backbone.Model.extend({
        urlRoot: '/api/users',
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

    // The model to hold user's likes
    var PostUserModel = Backbone.Model.extend({
        urlRoot: '/api/postuser',
        idAttribute: 'id'
    });

    // The collection for holding PostModels
    var PostsCollection = Backbone.Collection.extend({
        url: '/api/posts',
        model: PostModel
    });

    // The view for holding a PostCollection
    var PostsListView = Backbone.View.extend({

        // The el is the container for the view
        el: '<div class="post-list-container"></div>',

        // Listen to the following events
        events: {

            // If a .post is clicked then show all posts by that post's user
            'click .post': function(event) {

                // If the clicked link is invalid nothing happens
                event.preventDefault();

                // Set that=this so that we can use the 'this' scope inside of the success call below
                var that = this;

                // Create a UserModel from the data-user-id attribute of the clicked post
                var clickedUser = new UserModel({ id: $(event.target).data('user-id') });

                // fetch() is asynchronous, so add a success callback to indicate what should not be run until the fetch
                // successfully happens
                clickedUser.fetch({

                    // Populate the #main-window with all of the clicked user's posts, add a button to view your favorites,
                    // and adjust the size of the elements so everything stays aligned along the bottom edge of the app
                    success: function() {

                        // Create PostsCollection of clickedUser's posts
                        var posts = new PostsCollection(clickedUser.get('posts'));
                        posts.fetch();

                        // Create PostListView out of the new PostsCollection, and pass it the array of userLikes so the
                        // view knows which posts to put a red heart next to
                        var usersPostsListView = new PostsListView({
                            collection: posts,
                            userLikesArr: that.userLikesArr
                        });

                        // Populate #main-window with the new PostsListView and adjust the size as needed
                        $('#main-window').html(usersPostsListView.render().el);
                        $('#main-window').height("410px");

                        // Create title for #main-window
                        var mainTitle = "posts by @" + clickedUser.get('name');
                        $('#main-title').html(mainTitle);

                        // Add favorites button
                        $('#favorites-button').html("&rarr; click to see your favorites &larr;");

                        // Reset error message
                        $('#error').html("");

                    }
                });

                // Create a new PostModel to populate the #post-viewer-container with details about the post that was clicked
                var clickedPost = new PostModel({ id: $(event.target).data('id') });

                // fetch() data about the clickedPost
                clickedPost.fetch({

                    // Upon success, create a new PostDetailView populate with the clickedPost, then render that view and
                    // use it's el to populate the #post-viewer-container
                    success: function() {
                        var postDetailView = new PostDetailView({ model: clickedPost });
                        $('#post-viewer-container').html(postDetailView.render().el);
                    }
                });
            }
        },

        // initialize runs when the view is instantiated. This method can use 'options' which are anything but models
        // and collections that are passed into the view. In this case, we always pass this view an array of userLikes
        // which are used in the render() method below to identify which posts should have a red heart next to them
        initialize: function(options) {
            this.userLikesArr = options.userLikesArr;
        },

        // Gets 'collection' from HomeView's render(), which instantiates postListView with 'collection' as a parameter
        render: function() {

            // Set that=this so that we can use the 'this' scope inside of the forEach below
            var that = this;

            // Iterate through this view's collection, calling each iterated item a post
            this.collection.forEach(function(post) {

                // Turn each iterated post into a postView that has the array of userLikes
                var postView = new PostView({
                    model: post,
                    userLikesArr: that.userLikesArr
                });

                // Append the rendered el of the postView to this view's el
                that.$el.append(postView.render().el);
            });

            // Return 'this' so that when we call this view's render() elsewhere we can then access 'this' view's el
            return this;
        }
    });

    // The view for populating the #post-viewer-container
    var PostDetailView = Backbone.View.extend({

        // The el is the container for the view
        el: '<div class="post-viewer"></div>',

        // The underscore template that will populate the el
        template: _.template('\
            <div class="title-post-viewer">\
                &darr; <%= model.get("post_content") %> &darr;\
            </div>\
            <div class="post-viewer-details">\
                <h4>\
                    posted by @<%= model.get("user").name %>\
                    <br />\
                    <%= model.get("updated_at").substring(0,10) %>\
                </h4>\
            </div>\
        '),

        // Upon instantiation of this view the initialize is called
        initialize: function() {

            // Whenever the model for this view is changed, re-render this view
            this.listenTo(this.model, 'change', this.render);
        },

        // This populates the el with the template
        render: function() {

            // Use the model that was passed into this view to populate the template
            this.$el.html(this.template({ model: this.model }));

            // Return 'this' so that when we call this view's render() elsewhere we can then access 'this' view's el
            return this;
        }
    });

    // The view for populating a single post
    var PostView = Backbone.View.extend({

        // The el is the container for the view
        el: '<div class="post-container"></div>',

        // The underscore template that will populate the el
        // Note that the post's user_id is passed in as the attribute data-user-id
        // Note that there is a heart div with a variable id
        template: _.template('\
            <a class="post" data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
                <%= post.get("post_content") %>\
                <% if(post.get("user")) { %>\
                    <span data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
                        <br />\
                        @<%= post.get("user").name %>\
                    </span>\
                <% }; %>\
            </a>\
            <div class="heart" id="heart-<%= heartType %>" data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
                &hearts;\
            </div>\
        '),

        events: {

            // When a heart is clicked, format accordingly and add/remove it from arrays and tables
            'click .heart': function(event) {
                event.preventDefault();

                var clickedPostId = $(event.target).data('id');

                // If the clicked heart is 'normal' it is not favorited, so...
                if($(event.target).attr('id') === "heart-normal") {

                    // Format it to be 'favorited'
                    $(event.target).attr('id', 'heart-favorited');

                    // Add its post id to the array of user Likes
                    this.userLikesArr.push(clickedPostId);

                    // Add it to the database of user likes
                    var clickedPost = new PostUserModel({
                        post_id: clickedPostId
                    });
                    clickedPost.save();

                    // Add it to the window of user likes if that is the window that is currently open
                    if($('#main-title').text() === 'your favorited posts') {

                        // Set that=this so that we can use the 'this' scope inside of the success callback below
                        var that = this;

                        // Initialize a UserModel and then fetch it with the response "currentUser=true", which will trigger
                        // the UserController's index() to return the current user with all of their likes
                        var user = new UserModel();
                        user.fetch({
                            data: {
                                currentUser: true
                            },
                            success: function () {

                                // Create userLikes variable to hold all likes of current user
                                var userLikes = user.get('likes');

                                // Create a PostListView with the collection being userLikes, and pass it the array of
                                // userLikes so the view knows which posts to put a red heart next to
                                var postsListView = new PostsListView({
                                    collection: userLikes,
                                    userLikesArr: that.userLikesArr
                                });

                                // Populate the #main-window with the new postsListView
                                $('#main-window').html(postsListView.render().el);
                            }
                        });
                    }

                } else {

                    // Format the heart to be 'normal'
                    $(event.target).attr('id', 'heart-normal');

                    // Remove the id of the clicked heart from the userLikes array
                    var tempArray = [];
                    this.userLikesArr.forEach(function(likedId) {
                        if(likedId != clickedPostId) {
                            tempArray.push(likedId);
                        }
                    });
                    this.userLikesArr = tempArray;

                    // Remove it from the database of user Likes
                    var clickedPost = new PostUserModel({
                        id: clickedPostId
                    });
                    clickedPost.destroy();

                    // Prepare to re-render the necessary parts of the page by preparing a new UserModel
                    // Initialize a UserModel
                    var user = new UserModel();

                    // Set that=this so that we can use the 'this' scope inside of the success callback below
                    var that = this;

                    // fetch() the new UserModel with the response "currentUser=true", which will trigger the UserController's
                    // index() to return the current user with all of their likes
                    user.fetch({
                        data: {
                            currentUser: true
                        },
                        success: function () {

                            // Remove unliked post from the window of user likes if that is the window that is currently open
                            if($('#main-title').text() === 'your favorited posts') {

                                // Create userLikes variable to hold all likes of current user
                                var userLikes = user.get('likes');

                                // Create a PostListView with the collection being userLikes, and pass it the array of
                                // userLikes so the view knows which posts to put a red heart next to
                                var postsListView = new PostsListView({
                                    collection: userLikes,
                                    userLikesArr: that.userLikesArr
                                });

                                // Populate the #main-window with the new postsListView
                                $('#main-window').html(postsListView.render().el);
                            }

                            // Re-render all posts so that they reflect the "unlike"
                            var posts = new PostsCollection();
                            posts.fetch({
                                success: function() {
                                    var postsListView = new PostsListView({
                                        collection: posts,
                                        userLikesArr: that.userLikesArr
                                    });
                                    // Make sure to say postsListView.render().el instead of postsListView.el so that the view actually renders
                                    $('#all-posts').html(postsListView.render().el);
                                }
                            });
                        }
                    });
                }
            }
        },

        initialize: function(options) {
            this.listenTo(this.model, 'change', this.render);
            this.userLikesArr = options.userLikesArr;
        },

        render: function() {
            var heartType = "normal";
            var that = this;
            this.userLikesArr.forEach(function(likedId) {
                if(likedId === that.model.id) {
                    heartType = "favorited";
                }
            });
            this.$el.html(this.template({
                post: this.model,
                heartType: heartType
            }));

            // Return 'this' so that when we call this view's render() elsewhere we can then access 'this' view's el
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
                                    <input type="text" id="new-post" name="new-post" placeholder="enter post" maxlength="50"/>\
                                    <div id="error"></div>\
                                    <div id="submit">submit</div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="eight columns" id="content-container">\
                        <div class="title" id="main-title"></div>\
                        <a href="#">\
                            <div class="title-favorites" id="favorites-button"></div>\
                        </a>\
                        <div id="main-window"></div>\
                        <div id="post-viewer-container">\
                            <div class="title-post-viewer">&darr; post detail area &darr;</div>\
                            <div class="post-viewer-details">\
                                <br />\
                                <h4>no post clicked yet</h4>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        ',

        events: {
            "click #submit": "createPost",

            "click #favorites-button": "insertLikes"
        },

        render: function() {

            // Insert user's likes into DOM, and pass along array
            this.insertLikes();

            // Insert all posts into DOM, and pass along array
            this.insertAllPosts();

            // Return 'this' so that when we call this view's render() elsewhere we can then access 'this' view's el
            return this;
        },

        insertAllPosts: function() {

            var that = this;

            // Initialize a UserModel and then fetch it with the response "currentUser=true", which will trigger
            // the UserController's index() to return the current user with all of their likes
            var user = new UserModel();
            user.fetch({
                data: {
                    currentUser: true
                },
                success: function() {
                    // Create userLikes variable to hold all likes of current user
                    that.userLikes = user.get('likes');

                    // Create array of post ids for liked posts (not an array of the ids from the postuser table)
                    that.userLikesArr = [];
                    that.userLikes.forEach(function(like) {
                        that.userLikesArr.push(like.get('id'));
                    });

                    var posts = new PostsCollection();

                    posts.fetch({
                        success: function() {
                            var postsListView = new PostsListView({
                                collection: posts,
                                userLikesArr: that.userLikesArr
                            });
                            // Make sure to say postsListView.render().el instead of postsListView.el so that the view actually renders
                            that.$el.find('#all-posts').html(postsListView.render().el);
                        }
                    });
                }
            });
        },

        insertLikes: function() {

            var that = this;

            // Initialize a UserModel and then fetch it with the response "currentUser=true", which will trigger
            // the UserController's index() to return the current user with all of their likes
            var user = new UserModel();
            user.fetch({
                data: {
                    currentUser: true
                },
                success: function() {
                    // Create userLikes variable to hold all likes of current user
                    that.userLikes = user.get('likes');

                    // Create array of ids for liked posts
                    that.userLikesArr = [];
                    that.userLikes.forEach(function(like) {
                        that.userLikesArr.push(like.get('id'));
                    });

                    var postsListView = new PostsListView({
                        collection: that.userLikes,
                        userLikesArr: that.userLikesArr
                    });
                    that.$el.find('#main-window').html(postsListView.render().el);
                    that.$el.find('#main-title').html('your favorited posts');
                    that.$el.find('#main-window').height("442px");
                    that.$el.find('#favorites-button').html("");
                    that.$el.find('#error').html("");
                }
            });

        },

        createPost: function() {

            //var postContent = $('#new-post').value;

            // Get the value of the text input
            var postContent = document.getElementsByName('new-post')[0].value;

            // If the input is empty, tell the user with an alert
            if(postContent === "") {

                $('#error').html("please enter a post");

            // Otherwise, create a new post, save it to the backend, re-render the posts to update the list, then clear
            // the text field
            } else {
                var newPost = new PostModel();
                newPost.set({
                    post_content: postContent
                });

                newPost.save();

                this.insertAllPosts();

                $('#new-post').val("");

                $('#error').html("");
            }
        }
    });


    var homeView = new HomeView();
    $('#content').html(homeView.render().el);
});