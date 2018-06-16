# Node
fs   = require "fs"
path = require "path"

# NPM
log        = require "de-logger"
pugify     = require "pugify"
notifier   = require "node-notifier"
browserify = require "browserify"



class Browserify

	constructor: (@server) ->

		return if @server.config.type is 2

		@setup()
		@listeners()


	setup: ->

		# Short reference to browserify config
		@config = @server.config.browserify

		# Store multi setup folders
		@folders = []

		# Determin source folder
		@sFolder = @server.folders.src.client
		@sFolder = @server.folders.src.index if @server.config.type is 3
		@sFolder += path.sep+@config.folder

		# Determin source file
		@sFile = @sFolder+path.sep+@config.single.entry

		# Determin build folder
		@bFolder = @server.folders.build.client
		@bFolder = @server.folders.build.index if @server.config.type is 3
		@bFolder += path.sep+@config.folder

		# Determin build file
		@bFile  = @bFolder+path.sep+@config.single.entry.replace ".coffee", ".js"

		# Check if entry file exists
		fs.stat @sFile, (e) =>

			if not e
				@type = "single"
			else
				@type = "multi"
				@determin()

			log.info "#{@server.config.title} - Browserify", "Type: #{@type}"


	determin: ->

		# Read all files in entry folder
		fs.readdir @sFolder, (e, files) =>

			if e

				@notify msg = "Entry file not found: #{@sFile}"

				log.error "#{@server.config.title} - Browserify", "#{msg}\n", e

				return

			# Loop over all results
			for file in files

				# Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
				continue if not fs.statSync(folder = @sFolder+path.sep+file).isDirectory()

				# Add less bundle folders
				@folders.push
					name  : file
					build : @bFolder+path.sep+file

			return if @folders.length isnt 0

			@error()


	listeners: ->

		@server.vent.on "compiled:file", @check
		@server.vent.on "watch:initialized", @initialized


	initialized: =>

		@init = true

		# Tell the bundle where to find the pug runtime
		runtimePath = require.resolve "pug-runtime"

		options =

			# Add source map on envs other than production
			debug: @server.env isnt "production" and @config.debug

			# Do not show paths to files in the app.bundle.js
			fullPaths: false

		if @type is "single"

			bundle = @createBundle()

			# Create bundle stream
			@dFile = @bFolder+path.sep+@config.single.bundle

			# Store browserify bundle
			@b = browserify options

				# Add user entry file
				.add @bFile

				# Stream the bundle to a file write stream
				.on "bundle", bundle

				# Handle error
				.on "error", ->

					console.log "\nDexter"
					console.log arguments

			# Allow for .pug files to be added into the bundle
			@b.transform pugify.pug pretty: false, runtimePath: runtimePath, compileDebug: @server.env isnt "production"

			# Store starting time
			@t = (new Date).getTime()

			# Create bundle
			@b.bundle()


		if @type is "multi"

			# Store browserify bundles
			@b =
				# Tells browser-sync if type is multi or single
				_browserSyncIndicator: true

			# Store bundle times
			@t = {}

			# Store different bundles
			@_bundle = {}

			# Store destination files
			@dFile = {}

			for folder in @folders

				# Get folder name
				name = folder.name

				# Store time
				@t[name] = (new Date).getTime()

				# Create bundle by name
				@_bundle[name] = @createBundle name

				# Create bundle output stream path
				@dFile[name] = @bFolder+path.sep+name+path.sep+@config.multi

				# Store browserify bundle
				@b[name] = browserify options

					# Add user entry file
					.add @bFolder+path.sep+folder.name+path.sep+"index.js"

					# Stream the bundle to a file write stream
					.on "bundle", @_bundle[name]

					# Handle error
					.on "error", ->

						console.log "\nDexter multi"
						console.log arguments

				# Allow for .pug files to be added into the bundle
				@b[name].transform pugify.pug pretty: false, runtimePath: runtimePath, compileDebug: @server.env isnt "production"

				# Create bundle
				@b[name].bundle()

		# Notify browser-sync
		@server.vent.emit "browserify:initialized", @b


	check: (arg) =>

		file = arg?.file

		return if not @init

		# Comple a single bundle if multiple bundles are not required
		@make() if @type is "single"

		# Compile one (or all) of the multiple bundles
		@multi file if @type is "multi"


	multi: (file) ->

		return @error() if @folders.length is 0

		for folder in @folders

			(continue if -1 is file.indexOf folder.build) if file

			@make folder.name


	make: (name) ->

		# Set new time stamp again
		if name
			@t[name] = (new Date).getTime()
		else
			@t = (new Date).getTime()

		# Create for single bundle
		return @b.bundle() if not name

		# Rebuild the name specific bundle
		@b[name].bundle()


	createBundle: (name) ->

		bundle = (stream) =>

			message = ""
			message = "Bundle '#{name}' - " if name

			# Notify if mkdirp failed
			stream.on "error", (err) =>

				if err

					@notify "Unable to creat bundle\n#{err.message}", name

					log.error "#{@server.config.title} - Browserify", "\n#{message}Unable to creat bundle\n#{err.message}\n"

				return

			# Notify succes
			stream.on "end", =>

				# Determin time
				time = @t
				time = @t[name] if name

				# Calculate time differenve from the start of browserify
				time = (new Date().getTime()-time)/1000

				# Determin destination file
				dFile = @dFile
				dFile = @dFile[name] if name

				# Make the resulting path pretty
				destination = dFile.replace @server.root+path.sep, ""

				# Notify Browserify results
				log.info "#{@server.config.title} - Browserify", "#{message}#{destination} | #{@server.symbols.finished} #{time} s"

				# Notify the creation of a bundle
				@server.vent.emit "browserify:bundle", dFile

			# Create a destination write stream
			if name
				f = fs.createWriteStream @dFile[name]
			else
				f = fs.createWriteStream @dFile

			# Stream into the file
			stream.pipe f


	error: ->

		@notify msg = "No folders are found for a multi setup"

		log.error "#{@server.config.title} - Browserify", "\n#{msg}"


	notify: (message, name) ->

		notifier.notify
			title   : "#{@server.config.title} - Browserify - #{name}"
			message : message



module.exports = Browserify
