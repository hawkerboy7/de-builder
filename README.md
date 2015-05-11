# de-builder


## What is it?
It is a __Live Development Environment__ (LDE).<br>
In this environment you can write .coffee, .less and .jade and your code will be compiled on save.<br>
The corresponding part of you program will be either reloaded or restarted.


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
- Server + Client
- Server
- Client (Node Webkit)
- Client (Cordova)


## LDE's
When should I use which LDE?
_Type 1_ __Server + Client__: If you are making a program / server with a website interface.
_Type 2_ __Server__: If you are making a program / server without a website as a interface.
_Type 3_ __Client__: If you are making a program / server using the client-side part (like NodeWebkit)
_Type 4_ __Client__: If you are building an app for your phone with (Phonegap - Cordova)


## Modules
The main modules used to create this __LDE__:
- [Browser-sync](https://github.com/BrowserSync/browser-sync)
- [Browserify](https://github.com/substack/node-browserify)
- [Chokidar](https://github.com/paulmillr/chokidar)
- [Coffee-script](https://github.com/jashkenas/coffeescript)
- [De-logger](https://github.com/hawkerboy7/de-logger)
- [Forever-monitor](https://github.com/foreverjs/forever-monitor)
- [Jadeify](https://github.com/domenic/jadeify)
- [Less](https://github.com/less/less.js)
- [Watchify](https://github.com/substack/watchify)


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
- Add support for Server only (type 2)
- `--start` should also create client folders and entry files
- Create a setup with `de-base` and `de-nw-base` by providing arguments: `--de-base` and `--de-nw-base`
- Support for more programming languages (.litcoffee?, stylus?, sass?, livescript?, ES6?)
- And lots of other plans __these will be documented soon__


## Note
`de-builder` is an attempt at building a project like [id-builder](https://github.com/Industrial/id-builder). The difference for now is the supported programming languages (which are less in `de-builder`) and the supported __LDE__'s (which are [going to be] more in `de-builder`). Also `de-builder` provides a `--start` argument that sets up your project for you based on your config .