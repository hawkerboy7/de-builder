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
`npm install --save-dev de-builder`


## What is it?
`de-builder` creates a __Live Development Environment__ (LDE).<br>
In this environment you can write `.coffee`, `.less`, `.css` and `.jade` and your code will be compiled on save.<br>
The corresponding part of you program will be either injected or restarted.<br>
This is achieved by using various [modules](https://github.com/hawkerboy7/de-builder#modules).


## Getting Started
- Create a project folder `mkdir test`.
- Navigate to the project folder `cd test`.
- Create a package.json file to store all your project information. You could use `npm init`.
- Then `npm install --save-dev de-builder`.
- Once `de-builder` has been installed a `build.js` file will have been created.
- You can adjust the config in the `build.js` file according to your specifications (all default options are shown but not required).
- Now run `node build.js` and your __LDE__ will run and you can start working on your project.

NOTE: If you've keept all default settings and started `node build.js` in an empty project you will encounter two error's `LDE - Less` and `LDE - Browserify`. That's because by default an entry file for `less` and `browserify` is expected. You can disable `less`and `browserify` or create the entry files to solve the error.


## Support
The following languages are supported:
- .coffee
- .less
- .jade

The following types of LDE are supported:
- Server + Client
- Server [ 0.4.0+ is requried ]
- Client [ 0.5.0+ is requried ]

**Starting from version 0.7.0+ you can also create multiple browserify and less bundles!**

## LDE's
Which LDE should I use?<br>
_Type 1_ __Server + Client__: If you are making a program / server with a website interface.<br>
_Type 2_ __Server__: If you are making a program / server without a website as an interface.<br>
_Type 3_ __Client__: If you are making a program / server only using the client-side bundle part<br>


## Multiple bundles
`de-builder` will switch to 'multiple bundle mode' if the entry file defined in the config cannot be found.
In the console it will notify you which type is being used e.g.
```
info  LDE - Less       →  Type: single
info  LDE - Browserify →  Type: multi
```
In multi mode it will check all child folders of the `js` and/or `styles` (.less) folder and used them as the entry points. This means that a folder in multi mode must contain an `index(.coffee/.less)` file.


## Structure
Ok so how should I structre my project?
You can use the structre described below but you are free to choose, however make sure you provide the correct entry folder and file in the build.js folder if you choose a custom structure. You could also check [de-base](https://github.com/hawkerboy7/de-base) as an example project or better yet use it, since it's created as a basis to start other projects from.


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
	express/
		views/
			index.jade
		index.coffee
	server/
		db/
			users.coffee
			index.coffee
		config.coffee
		index.coffee
	socketIO/
		handler/
			index.coffee
		index.coffee
	app.coffee
	manager.coffee
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
		app/
			elements/
				header.coffee
			templates/
				header.jade
			index.coffee
			main.coffee
			router.coffee
		vendor/
			index.coffee
	styles/
		elements/
			header.less
			main.less
		app.less
		variables.less
```


## Browser-sync
Once `de-builder` is running the `browser-sync` `ui` can by default be found at [localhost:9000](http://localhost:9000).
The required `browser-sync` code-snippet has been added to the bundle already by `de-builder` so `browser-sync` will work out of the box on all your pages and devices =D!
In `multi` mode folder(s) are to be provided telling `de-builder` in which bundle(s) to add the browser-sync snippet. By default `vendor` is used.


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
	src   : 'src'
	build : 'build'

	# Client and server directory
	client: 'client'
	server: 'server'

	# Less directory and entry file
	less:
		file   : 'app.css'
		entry  : 'app.less'
		folder : 'styles'

	# Browserify directory and entry file
	browserify:

		# Used for single build
		single:
			entry  : 'app.coffee'
			bundle : 'app.bundle.js'

		# Used for multi build
		multi : 'bundle.js'

		# Used in both cases
		# Show or hide source maps that allow you to debug your files separately.
		debug  : true

		# Folder to js files
		folder : 'js'

	# Server path/file to be started by forever
	forever:
		entry   : 'app.js'
		enabled : true

	# Use browser-sync options
	browserSync:

		# Use it, or not
		enabled : true

		# user interface port
		ui      : 9000

		# server port
		server  : 9001

		# Provide names of the multi bundle(s) that should contain the browser-sync code
		multi   : ['vendor']

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client
	type: 1

	# Socket.io server for listening to de-builder events
	io : 8009

	# Show de-builder debug events
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