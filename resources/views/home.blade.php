<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>bitter</title>

    <!-- Fonts -->


    <!-- Styles -->
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css" />
    <style>
        #all-posts {
            height: 400px;
            overflow: scroll;
        }
        #main-window {
            height: 440px;
            overflow: scroll;
        }
        /*#post-form {*/
            /*height: 75px;*/
        /*}*/

        /*.post-container {*/
            /*border: 4px dotted blue;*/
        /*}*/

        .post-container div {
            border-bottom: 1px dotted darkgray;
            line-height: 15px;
            padding: 7px;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        a {
            text-decoration: none;
        }
        .title {
            background-color: lightseagreen;
            color: white;
            font-size: 20px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .title-favorites {
            background-color: #3592b2;
            color: white;
            font-size: 20px;
            text-align: center;
        }
        .title-post-viewer {
            background-color: #d6d1d3;
            color: white;
            font-size: 20px;
            text-align: center;
        }
        .post-viewer-details {
            text-align: center;
            color: #3592b2;
        }

        #error {
            background-color: rgba(205, 52, 55, 0.81);
            color: white;
            font-size: 20px;
            text-align: center;
        }

        input[type="text"] {
            width: 100%;
            margin-bottom: 0px;
            border-radius: 0;
        }

        #submit {
            margin-bottom: 0px;
            width: 100%;
            background-color: #3592b2;
            color: white;
            height: 38px;
            font-size: 20px;
            line-height: 33px;
            text-align: center;
            border-top-right-radius: 0;
            border-top-left-radius: 0;
            border-bottom-left-radius: 9px;
            border-bottom-right-radius: 9px;
        }
        #submit:hover {
            border: 1px solid gray;
        }
        #submit:active {
            background-color: #2e7c98;
            color: #d5d5d5;
        }

        #content-container {
            margin-bottom: 40px;
            border: 1px solid darkgray;
            border-radius: 10px;
        }
        #post-viewer-container {
            height: 110px;
        }
        span {
            font-size: 12px;
            color: #d6d1d3;
        }

    </style>



</head>
<body>

    <div id="content">

    </div>


    <!-- JavaScripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone.js"></script>
    <!-- asset maps to "public" folder -->
    <script src="{{ asset('js/app.js') }}"></script>

</body>
</html>