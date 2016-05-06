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

                // Create a UserModel from the data-user-id attribute of the clicked post
                var clickedUser = new UserModel({ id: $(event.target).data('user-id') });

                // Populate the #main-window with all posts from the clickedUser
                this.getClickedUserPosts(clickedUser);

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
        // so that we can continue passing these likes to other views that we instantiate through this view
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
        },

        // Populate the #main-window with all posts from the passed in clickedUser
        getClickedUserPosts: function(clickedUser) {

            // Set that=this so that we can use the 'this' scope inside of the success call below
            var that = this;

            // fetch() is asynchronous, so add a success callback to indicate what should not be run until the fetch
            // successfully happens
            clickedUser.fetch({

                // Populate the #main-window with all of the clicked user's posts, add a button to view your favorites,
                // and adjust the size of the elements so everything stays aligned along the bottom edge of the app
                success: function() {

                    // Create PostsCollection of clickedUser's posts
                    var posts = new PostsCollection(clickedUser.get('posts'));

                    // Uncomment this line to add user name to each post when viewing all posts by a user
                    // NOTE: There is a lag between rendering the posts and rendering the user names
                    //posts.fetch();

                    // Create PostListView out of the new PostsCollection, and pass it the array of userLikes so the
                    // view knows which posts to put a red heart next to
                    var usersPostsListView = new PostsListView({
                        collection: posts,
                        userLikesArr: that.userLikesArr
                    });

                    // Populate #main-window with the new PostsListView and adjust the size as needed
                    $('#main-window').html(usersPostsListView.render().el);
                    $('#main-window').height("408px");

                    // Create title for #main-window
                    var mainTitle = "posts by @" + clickedUser.get('name');
                    $('#main-title').html(mainTitle);

                    // Add favorites button
                    $('#favorites-button').html("&rarr; click to see your favorites &larr;");

                    // Reset error message
                    $('#error').html("");

                }
            });
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
        // Note that there is a heart div with a variable id. This id will dictate the heart's formatting (red or gray)
        // and by default = 'heart-normal'
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

            // When a heart is clicked, format accordingly and add/remove it from array and views
            'click .heart': function(event) {
                event.preventDefault();

                // Get the post id of the clicked heard
                var clickedPostId = $(event.target).data('id');

                // If the clicked heart is 'normal' it is not favorited, so...
                if($(event.target).attr('id') === "heart-normal") {

                    // Format it to be 'favorited'
                    //$(event.target).attr('id', 'heart-favorited');

                    // Add its post id to the array of user Likes
                    this.userLikesArr.push(clickedPostId);

                    // Add it to the database of user likes
                    var clickedPost = new PostUserModel({
                        post_id: clickedPostId
                    });
                    clickedPost.save();


                    console.log('1. Add like to DB');

                // Otherwise if the heart is not 'normal' it is already favorited, so...
                } else {

                    // Format the heart to be 'normal'
                    //$(event.target).attr('id', 'heart-normal');

                    // Remove the id of the clicked heart from the userLikes array
                    var tempArray = [];
                    this.userLikesArr.forEach(function (likedId) {
                        if (likedId != clickedPostId) {
                            tempArray.push(likedId);
                        }
                    });
                    this.userLikesArr = tempArray;

                    // Remove it from the database of user Likes
                    var clickedPost = new PostUserModel({
                        id: clickedPostId
                    });
                    clickedPost.destroy();

                    console.log('1. Remove like from DB');
                }

                // Prepare to re-render the necessary parts of the page by preparing a new UserModel
                // Initialize a UserModel
                var user = new UserModel();

                // Set that=this so that we can use the 'this' scope inside of the success callback below
                var that = this;

                // Remove unliked post from the window of user likes if that is the window that is currently open
                if($('#main-title').text() === 'your favorited posts') {

                    // fetch() the new UserModel with the response "currentUser=true", which will trigger the UserController's
                    // index() to return the current user with all of their likes
                    user.fetch({
                        data: {
                            currentUser: true
                        },
                        success: function () {

                            console.log('2. Get logged in user');

                            // Create userLikes variable to hold all likes of current user
                            var userLikes = user.get('likes');

                            console.log(userLikes);

                            // Create a PostListView with the collection userLikes, and pass it the array of
                            // userLikes so the view knows which posts to put a red heart next to
                            var postsListView = new PostsListView({
                                collection: userLikes,
                                userLikesArr: that.userLikesArr
                            });

                            console.log(postsListView);

                            // Populate the #main-window with the new postsListView
                            $('#main-window').html(postsListView.render().el);

                            console.log('3. Render new view of favorites');

                            // Re-render homeViews all-posts window
                            homeView.insertAllPosts();
                            console.log('4. Render all posts');
                        }
                    });

                // Otherwise, if the #main-title is not 'your favorited posts' then that means we are viewing a specific
                // user's posts, so re-render view accordingly
                } else {

                    // Create a UserModel from the data-user-id attribute of the clicked post
                    var clickedUser = new UserModel({ id: $(event.target).data('user-id') });

                    // Fetch the clickedUser
                    clickedUser.fetch({

                        // Upon success, get the user's posts
                        success: function() {

                            console.log('2. Get clicked user');

                            var userPosts = clickedUser.get('posts');

                            console.log(userPosts);

                            // Then create a view out of those posts
                            var postsListView = new PostsListView({
                                collection: userPosts,
                                userLikesArr: that.userLikesArr
                            });

                            console.log(postsListView);

                            // And use the view's method to render the clickedUser's posts
                            postsListView.getClickedUserPosts(clickedUser);

                            console.log('3. Render new view of clicked users posts');

                            // Re-render homeViews all-posts window
                            homeView.insertAllPosts();
                            console.log('4. Render all posts');
                        }
                    });
                }
            }
        },

        // initialize runs when the view is instantiated. This method can use 'options' which are anything but models
        // and collections that are passed into the view. In this case, we always pass this view an array of userLikes
        // which are used in the render() method below to identify which posts should have a red heart next to them
        initialize: function(options) {

            // Listen for changes to the view's model. Upon a change, re-render
            //this.listenTo(this.model, 'change', this.render);

            // Create an array of UserLikes based off of the array passed through the options
            this.userLikesArr = options.userLikesArr;

            if(options.clickedUsersPostsArr) {
                this.clickedUsersPostsArr = options.clickedUsersPostsArr;
            }
        },

        // Populate this view's el with the template
        render: function() {

            // By default the heart type is 'normal'
            var heartType = "normal";

            // Set that=this so that we can use the 'this' scope inside of the forEach below
            var that = this;

            // Iterate over the array of userLikes
            this.userLikesArr.forEach(function(likedId) {

                // If any of the userLikes' ids (which are post ids) matches the current model's (post's) id, set the
                // heartType to 'favorited'
                if(likedId === that.model.id) {
                    heartType = "favorited";
                }
            });

            // Populate this view's el with the template, and pass the template the current model (post) as well as the
            // heartType, which is used as a dynamic value
            this.$el.html(this.template({
                post: this.model,
                heartType: heartType
            }));

            // Return 'this' so that when we call this view's render() elsewhere we can then access 'this' view's el with
            // statements such as postView.render().el
            return this;
        }
    });

    // The main app
    var HomeView = Backbone.View.extend({

        // The visual structure of the app
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

        // Continuously listen for these events
        events: {

            // If the #submit button is pressed then create a poast
            "click #submit": "createPost",

            // If the #favorites-button is pressed then insert the view of the user's likes
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

        // Insert all posts into the DOM, and pass along array
        insertAllPosts: function() {

            // Set that=this so that we can use the 'this' scope in the success callback below
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

                    // Create a new PostsCollection to hold all of the posts
                    var posts = new PostsCollection();

                    // Fetch all of these posts
                    posts.fetch({

                        // Upon success, populate a new view with the now-fetched posts as well as the array of userLikes
                        success: function() {
                            var postsListView = new PostsListView({
                                collection: posts,
                                userLikesArr: that.userLikesArr
                            });

                            // Make sure to say postsListView.render().el instead of postsListView.el so that the view
                            // actually renders
                            that.$el.find('#all-posts').html(postsListView.render().el);
                        }
                    });
                }
            });
        },

        // Insert user's likes into DOM, and pass along array
        insertLikes: function() {

            // Set that=this so that we can use the 'this' scope in the success callback below
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

                    // Now that the user's likes have been successfully fetched, populate a new view with the now-fetched
                    // posts as well as the array of userLikes
                    var postsListView = new PostsListView({
                        collection: that.userLikes,
                        userLikesArr: that.userLikesArr
                    });

                    // Populate the #main-window with the userLikes
                    that.$el.find('#main-window').html(postsListView.render().el);

                    // Set the title to reflect that the favorited posts are being shown
                    that.$el.find('#main-title').html('your favorited posts');

                    // Set the #main-window to the proper height to compensate for the lack of a #favorites-button
                    that.$el.find('#main-window').height("440px");
                    that.$el.find('#favorites-button').html("");

                    // Reset error message
                    that.$el.find('#error').html("");
                }
            });

        },

        // Provide the functionality to add posts to the database
        createPost: function() {

            // Get the value of the text input
            var postContent = document.getElementsByName('new-post')[0].value;

            // If the input is empty, populate the #error div with a message
            if(postContent === "") {

                $('#error').html("please enter a post");

            // Otherwise...
            } else {

                // Create a new post and save it to the backend
                var newPost = new PostModel();
                newPost.set({
                    post_content: postContent
                });
                newPost.save();

                // Re-render the posts to update the list
                this.insertAllPosts();

                // Clear the text field and error div
                $('#new-post').val("");
                $('#error').html("");
            }
        }
    });

    // Get the current url path
    var path = window.location.pathname;

    // Only when the path = '/home' should you run the homeView
    if(path === '/home') {

        // Instantiate a new HomeView
        var homeView = new HomeView();

        // Populate the main #content div of the page with the new homeView's rendered el
        $('#content').html(homeView.render().el);
    }
});