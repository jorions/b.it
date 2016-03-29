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

var PostsCollection = Backbone.Collection.extend({
    url: '/api/posts/',
    model: PostModel
});




var PostsListView = Backbone.View.extend({
    el: '<div class="post-container"></div>',

    template: _.template('\
        <% posts.each(function(post) { %>\
            <div class="post"><%= post.get("post_content") %></div>\
        <% }) %>\
    '),

    initialize: function() {
        this.listenTo(this.collection, 'update', this.render);
    },

    render: function() {
        this.$el.html(this.template({ posts: this.collection }));
        return this;
    }
});




var HomeView = Backbone.View.extend({
    el: '\
        <div class="container">\
            <div class="row">\
                <div class="three columns" id="liked-posts"></div>\
                <div class="nine columns" id="all-posts"></div>\
            </div>\
        </div>\
    ',

    render: function() {
        var posts = new PostsCollection();
        posts.fetch();
        var postsListView = new PostsListView({ collection: posts });
        this.$el.find('#all-posts').html(postsListView.el);
        return this;
    }
});



var homeView = new HomeView();
$('#content').html(homeView.render().el);