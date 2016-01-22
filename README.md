<p align="center">
	<a target="_blank" href="https://travis-ci.org/hawkerboy7/de-builder">
		<img src="https://img.shields.io/travis/hawkerboy7/de-builder.svg">
	</a>
	<a target="_blank" href="https://david-dm.org/hawkerboy7/de-builder">
		<img src="https://img.shields.io/david/hawkerboy7/de-builder.svg">
	</a>
	<a target="_blank" href="https://www.npmjs.com/package/de-builder">
		<img src="https://img.shields.io/npm/dm/de-builder.svg">
	</a>
	<a target="_blank" href="https://www.codacy.com/app/dunk_king7/de-builder/dashboard">
		<img src="https://img.shields.io/codacy/59e450c5937442c6bd2772810ff55fdd.svg">
	</a>
	<a target="_blank" href="https://gitter.im/hawkerboy7/de-builder">
		<img src="https://img.shields.io/badge/Gitter-JOIN%20CHAT%20%E2%86%92-1dce73.svg">
	</a>
</p>


# de-builder


## What is it?
`de-builder` creates a __Live Development Environment__ (LDE).<br>
In this environment you can write `.coffee`,`.js`, `.less`, `.css` and `.jade` and your code will be compiled on save.<br>
The corresponding part of you program will be either reloaded or restarted.<br>
This is achieved by using the [modules](https://github.com/hawkerboy7/de-builder#modules).


## Getting Started
- Create a project folder `mkdir example-project`.
- Then `cd example-project/`.
- There `npm install --save-dev de-builder`.
- Once `de-builder` has been installed a `build.js` file will have been created.
- You can adjust the config in the `build.js` file according to your specifications.
- Now run `node build.js` and your __LDE__ will run and you can start working on your project.


## Support
The following languages are supported:
- .coffee
- .js
- .less
- .css
- .jade

The following types of LDE are [going to be] supported:
- __supported__ Server + Client
- __supported__ Server [ 0.4.0+ is requried ]
- __supported__ Client (node-webkit) [ 0.5.0+ is requried ]
- __not supported yet__ (Cordova)


## LDE's
Which LDE should I use?<br>
_Type 1_ __Server + Client__: If you are making a program / server with a website interface.<br>
_Type 2_ __Server__: If you are making a program / server without a website as an interface.<br>
_Type 3_ __Client__: If you are making a program / server only using the client-side part (like node-webkit)<br>
_Type 4_ : If you are building an app for your phone with (Phonegap - Cordova)


## Structure
Ok so how should I strucutre my project?
You can use the strucutre described below but you are free to choose, however make sure you provide the correct entry folder and file in the build.js folder if you choose a custom structure. You can also check [de-base](https://github.com/hawkerboy7/de-base) and [de-nw-base](https://github.com/hawkerboy7/de-nw-base) as an example project or even better use them since they are made to be a base for a project.


#### Server + Client (LDE type 1)
Without the `src/` folders shown in type 2 and 3
```
src/
	client/
		Client (LDE type 3)

	server/
		Server (LDE type 2)
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


#### Client (LDE type 3)
```
src/
	fonts/
		font-file.ttf
		font-file2.ttf
	images/
		favicon.ico
		users/
			user1.png
			user2.png
	js/
		templates/
			pages/
				page-1.jade
				page-2.jade
			header.jade
			navigation.jade
			footer.jade
			index.jade
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
```


## Browser-sync
Once `de-builder` is running the `browser-sync` `ui` can be found at [localhost:9000](http://localhost:9000).
The required `browser-sync` code-snippet has been added to the bundle already by `de-builder` so `browser-sync` will work out of the box on all your pages and devices =D!


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

		# show or hide source maps that allow you to debug your files separately.
		debug:	true

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
	# 3 Client (node-webkit)
	# 4 Client (Cordova)
	type:	1

	# Show de-builder events
	debug: false
```


## Common errors

#### Filewatchers
There is a limit to how may files can be watched at the same time.
So if you are running `dropbox`, a gui for `git`, `sublime text` and `de-builder` it's easily possible to run out of file watchers.
You can get the error: `Fatal error: watch ENOSPC`

Use the follwoing line to increase the allowed filewatchers on your system:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
source: http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc

#### Port in use
Pay attention to which port you are using and if another process issn't already running it.
If you run `node build.js` you may see the error: ` Error: listen EADDRINUSE`. Check if your port is unique. If so your current application might still be running. Check with `top` or `htop` in the ternimal and terminate it.


## Planned Support / Features
- Add support for __LDE__ type 4
- Add testing support with [Mocha](https://github.com/mochajs/mocha)
- Add support for .scss
- Create a setup with
	[de-base](https://github.com/hawkerboy7/de-base)
	and
	[de-nw-base](https://github.com/hawkerboy7/de-nw-base)
	by providing arguments: `--de-base` and `--de-nw-base`