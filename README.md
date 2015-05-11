# de-builder


## What is it?
It is a __Live Development Environment__ (LDE).<br>
In this environment you can write .coffee, .less and .jade and your code will be compiled on save.<br>
The corresponding part of you program will be either reloaded or restarted.<br>
This is achieved by using the [modules](https://github.com/hawkerboy7/de-builder#modules).


## Getting Started
- Create a project folder `mkdir example-project`.
- Then `cd example-project/`.
- There `npm install --save-dev de-builder`.
- Once `de-builder` has been installed a `build.js` file will have been created.
- You can adjust the config in the `build.js` file according to your specifications.
- Now run `node build.js --start`.
- This will setup your project based on the [config](https://github.com/hawkerboy7/de-builder#config).
- Now run `node build.js` and your LDE will run and you can start working on your project.


## Support
The following programming languages are supported:
- .coffee
- .less
- .jade

The following types of LDE are [going to be] supported:
- __supported__ Server + Client
- __not supported yet__ Server
- __not supported yet__ Client (Node Webkit)
- __not supported yet__ Client (Cordova)


## LDE's
When should I use which LDE?<br>
_Type 1_ __Server + Client__: If you are making a program / server with a website interface.<br>
_Type 2_ __Server__: If you are making a program / server without a website as an interface.<br>
_Type 3_ __Client__: If you are making a program / server only using the client-side part (like NodeWebkit)<br>
_Type 4_ __Client__: If you are building an app for your phone with (Phonegap - Cordova)


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
		file: 'app.js'

	# LDE environments
	# 1 Server + Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type:	1
```


## Planned Features
- Browser-sync
- Add support for LDE __Server__ (type 2)
- `--start` should also create client folders and entry files
- Add support for LDE __Client (Node Webkit)__ (type 3)
- Create a setup with
	[de-base](https://github.com/hawkerboy7/de-base)
	and
	[de-nw-base](https://github.com/hawkerboy7/de-nw-base)
	by providing arguments: `--de-base` and `--de-nw-base`
- Add testing support with [Mocha](https://github.com/mochajs/mocha)
- Support for more programming languages (.litcoffee?, stylus?, sass?, livescript?, ES6?)
- And lots of other plans __these will be documented soon__


## Note
`de-builder` is an attempt at building a project like [id-builder](https://github.com/Industrial/id-builder).
The difference for now is the supported programming languages (which are less in `de-builder`) and the supported __LDE__'s (which are [going to be] more in `de-builder`).
Also `de-builder` provides a `--start` argument that sets up your project for you based on your config .