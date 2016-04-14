<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>b.itter</title>

    <!-- Fonts -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel='stylesheet' type='text/css'>
    <link href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700" rel='stylesheet' type='text/css'>

    <!-- Styles -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css" rel="stylesheet" type="text/css" />
    {{-- <link href="{{ elixir('css/app.css') }}" rel="stylesheet"> --}}

    <style>
        /*body {*/
            /*font-family: 'Lato';*/
        /*}*/

        .fa-btn {
            margin-right: 6px;
        }

        .logo {
            font-size: 50px;
            width: 100%;
            color: #3592b2;
        }
        #all-posts {
            height: 400px;
            overflow: scroll;
        }
        #main-window {
            height: 442px;
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
        a, a:hover, a:active, a:visited, a:link {
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
            height: 32px;
            text-align: center;
            overflow: scroll;
        }
        .post-viewer-details {
            text-align: center;
            color: #3592b2;
            overflow: scroll;
            height: 78px;
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
<body id="app-layout">
    <nav class="navbar navbar-default navbar-static-top">
        <div class="container">
            <div class="navbar-header">

                <!-- Collapsed Hamburger -->
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#app-navbar-collapse">
                    <span class="sr-only">Toggle Navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>

                <!-- Branding Image -->
                <a class="navbar-brand" href="{{ url('/') }}">
                    b.itter
                </a>
            </div>

            <div class="collapse navbar-collapse" id="app-navbar-collapse">
                <!-- Left Side Of Navbar -->
                <ul class="nav navbar-nav">
                    <li><a href="{{ url('/home') }}">Home</a></li>
                </ul>

                <!-- Right Side Of Navbar -->
                <ul class="nav navbar-nav navbar-right">
                    <!-- Authentication Links -->
                    @if (Auth::guest())
                        <li><a href="{{ url('/login') }}">Login</a></li>
                        <li><a href="{{ url('/register') }}">Register</a></li>
                    @else
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                                {{ Auth::user()->name }} <span class="caret"></span>
                            </a>

                            <ul class="dropdown-menu" role="menu">
                                <li><a href="{{ url('/logout') }}"><i class="fa fa-btn fa-sign-out"></i>Logout</a></li>
                            </ul>
                        </li>
                    @endif
                </ul>
            </div>
        </div>
    </nav>

    @yield('content')

    <!-- JavaScripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone.js"></script>
    <!-- asset maps to "public" folder -->
    <script src="{{ asset('js/app.js') }}"></script>
    {{-- <script src="{{ elixir('js/app.js') }}"></script> --}}
</body>
</html>
