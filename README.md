[![Build Status](https://travis-ci.org/hawkerboy7/de-builder.svg?branch=master)](https://travis-ci.org/hawkerboy7/de-builder)&nbsp;&nbsp;[![Join the chat at https://gitter.im/hawkerboy7/de-builder](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/hawkerboy7/de-builder?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


# de-builder


## What is it?
`de-builder` creates a __Live Development Environment__ (LDE).<br>
In this environment you can write .coffee, .less and .jade and your code will be compiled on save.<br>
The corresponding part of you program will be either reloaded or restarted.<br>
This is achieved by using the [modules](https://github.com/hawkerboy7/de-builder#modules).


## Getting Started
- Create a project folder `mkdir example-project`.
- Then `cd example-project/`.
- There `npm install --save-dev de-builder`.
- Once `de-builder` has been installed a `build.js` file will have been created.
- You can adjust the config in the `build.js` file according to your specifications.
- (Optional: `node build.js --start`) A setup of your project files and folder based on the [config](https://github.com/hawkerboy7/de-builder#config).
- Now run `node build.js` and your __LDE__ will run and you can start working on your project.


## Support
The following languages are supported:
- .coffee
- .less
- .jade

The following types of LDE are [going to be] supported:
- __supported__ Server + Client
- __supported__ Server [ 0.4.0+ is requried ]
- __not supported yet__ Client (Node Webkit)
- __not supported yet__ ??? (Cordova)


## LDE's
Which LDE should I use?<br>
_Type 1_ __Server + Client__: If you are making a program / server with a website interface.<br>
_Type 2_ __Server__: If you are making a program / server without a website as an interface.<br>
_Type 3_ __Client__: If you are making a program / server only using the client-side part (like NodeWebkit)<br>
_Type 4_ __???__: If you are building an app for your phone with (Phonegap - Cordova)


## Structure
Ok so how should I strucutre my project?
You can use the strucutre described below but you are free to choose, however make sure you provide the correct entry folder and file in the build.js folder if you choose a custom structure. You can also check [de-base](https://github.com/hawkerboy7/de-base) as an example project or even better use it since it is made to be a base for a project.


#### Server + Client (LDE type 1)
```
src/
	client/
		fonts/
			font-file.ttf
			font-file2.ttf
		images/
			favicon.ico
			users/
				user1.png
				user2.png
		js/
			pages/
				page-1.coffee
				page-2.coffee
			navigation.coffee
			app.coffee
		styles/
			pages/
				page-1.less
				page-2.less
			app.less
		templates/
			pages/
				page-1.jade
				page-2.jade
			header.jade
			navigation.jade
			footer.jade
			index.jade

	server/
		express/
			views/
				index.coffee
			index.coffee
		server/
			mongodb.coffee
			index.coffee
		app.coffee
```

#### Server (LDE type 2)
```
src/
	features/
		feature-1.coffee
		feature-2.coffee
		index.coffee
	server/
		mongodb.coffee
		index.coffee
	app.coffee
```


## Browser-sync
Once `de-builder` is running the `browser-sync` `ui` can be found at [localhost:9000](http://localhost:9000).
The required `browser-sync` code-snippet has been added to the bundle already by `de-builder` so `browser-sync` will work out of the box =D!


## Modules
The main modules used to create this __LDE__:
- [Browser-sync](https://github.com/BrowserSync/browser-sync)
- [Browserify](https://github.com/substack/node-browserify) + [Watchify](https://github.com/substack/watchify)
- [Chokidar](https://github.com/paulmillr/chokidar)
- [Coffee-script](https://github.com/jashkenas/coffeescript)
- [De-logger](https://github.com/hawkerboy7/de-logger)
- [Forever-monitor](https://github.com/foreverjs/forever-monitor)
- [Jadeify](https://github.com/domenic/jadeify)
- [Less](https://github.com/less/less.js)


## Config
```coffeescript
# Default
config =

	# Source and build directory
	src:	'src'
	build:	'build'

	# Client and server directory
	client:	'client'
	server:	'server'

	# Less directory and entry file
	less:
		file:	'app.less'
		folder:	'styles'

	# Browserify directory and entry file
	browserify:
		file:	'app.js'
		folder:	'js'

	# Server path/file to be started by forever
	forever:
		enabled: true
		file:	 'app.js'

	# Start browser-sync and adds it to the browserify bundle
	browserSync:
		enabled: true

	# LDE environments
	# 1 Server + Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type:	1
```


## Planned Features / Known bugs
- Client-side .jade doesn't trigger browserify.
- `--start` should also create all required entry files and folders.
- Forever doesn't shutdown a child properly if a compile error's out, so killall sometimes needs to be used.
- Add support for __LDE__ type 3
- Fixing initial-build ready-trigger. This should be after all initial compiling is finished now it's based on a timeout.
- Add support for __LDE__ type 4
- Add testing support with [Mocha](https://github.com/mochajs/mocha)
- Support for more programming languages (.scss?, .litcoffee?, .styl?, ES6?, .ls?)
- Create a setup with
	[de-base](https://github.com/hawkerboy7/de-base)
	and
	[de-nw-base](https://github.com/hawkerboy7/de-nw-base)
	by providing arguments: `--de-base` and `--de-nw-base`
- And lots of other plans __these will be documented soon__


## Note
`de-builder` is an attempt at building a project like [id-builder](https://github.com/Industrial/id-builder). They have to following differences:
- The supported programming languages (which are less in `de-builder`).
- The supported __LDE__'s (which are more in `de-builder`).
- `de-builder` provides the possibility to pass on arguments which can setup your project for you.
	* `--start` creates all entry files and folders so you know where to start.
	* `--de-base` installs [de-base](https://github.com/hawkerboy7/de-base) for you.
	* `--de-nw-base` installs [de-nw-base](https://github.com/hawkerboy7/de-nw-base) for you.
