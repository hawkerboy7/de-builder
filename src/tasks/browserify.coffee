# Node
fs   = require 'fs'
path = require 'path'

# NPM
log        = require 'de-logger'
jadeify    = require 'jadeify'
browserify = require 'browserify-windows-fix'



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
		@bFile  = @bFolder+path.sep+@config.single.entry.replace '.coffee', '.js'

		# Check if entry file exists
		fs.stat @sFile, (e) =>

			if not e
				@type = 'single'
			else
				@type = 'multi'
				@determin()

			log.info "#{@server.config.title} - Browserify", "Type: #{@type}"


	determin: ->

		log.debug "#{@server.config.title} - Browserify", "Entry file not found: #{@sFile}"

		# Read all files in entry folder
		fs.readdir @sFolder, (e, files) =>

			return log.error "#{@server.config.title} - Browserify", e if e

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

		@server.vent.on 'compiled:file', @check
		@server.vent.on 'watch:initialized', @initialized


	initialized: =>

		@init = true

		options =

			# Watchify
			cache:        {}
			packageCache: {}

			# Add source map
			debug: @config.debug

			# Don't show paths to files in the app.bundle.js
			fullPaths: false

		if @type is 'single'

			bundle = @createBundle()

			# Create bundle stream
			@dFile = @bFolder+path.sep+@config.single.bundle

			# Store watchify browserify bundle
			@w = browserify options

				# Add user entry file
				.add @bFile

				# Allow for .jade files to be added into the bundle
				.transform jadeify, runtimePath: require.resolve 'jade/runtime'

				# Stream the bundle to a file write stream
				.on 'bundle', bundle

			# Store starting time
			@t = (new Date).getTime()

			# Create bundle
			@w.bundle()

		if @type is 'multi'

			# Store watchify browserify bundles
			@w =
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

				# Store watchify browserify bundle
				@w[name] = browserify options

					# Add user entry file
					.add @bFolder+path.sep+folder.name+path.sep+'index.js'

					# Allow for .jade files to be added into the bundle
					.transform jadeify, runtimePath: require.resolve 'jade/runtime'

					# Stream the bundle to a file write stream
					.on 'bundle', @_bundle[name]

				# Create bundle
				@w[name].bundle()

		# Notify browser-sync
		@server.vent.emit 'browserify:initialized', @w


	check: (arg) =>

		file = arg?.file

		return if not @init

		# Comple a single bundle if multiple bundles are not required
		@make() if @type is 'single'

		# Compile one (or all) of the multiple bundles
		@multi file if @type is 'multi'


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
		return @w.bundle() if not name

		# Rebuild the name specific bundle
		@w[name].bundle()


	createBundle: (name) ->

		bundle = (stream) =>

			message = ""
			message = "#{name}: " if name

			# Notify if mkdirp failed
			stream.on 'error', (err) =>
				return log.error "#{@server.config.title} - Browserify", "#{message}Unable to creat bundle \n\n", err if err

			# Notify succes
			stream.on 'end', =>

				# Determin time
				time = @t
				time = @t[name] if name

				# Calculate time differenve from the start of browserify
				time = (new Date().getTime()-time)/1000

				# Determin destination file
				dFile = @dFile
				dFile = @dFile[name] if name

				# Make the resulting path pretty
				destination = dFile.replace @server.root+path.sep, ''

				# Notify Browserify results
				log.info "#{@server.config.title} - Browserify", "#{message}#{destination} | #{@server.symbols.finished} #{time} s"

				# Notify the creation of a bundle
				@server.vent.emit 'browserify:bundle', dFile

			# Create a destination write stream
			if name
				f = fs.createWriteStream @dFile[name]
			else
				f = fs.createWriteStream @dFile

			# Stream into the file
			stream.pipe f


	error: ->

		log.error "#{@server.config.title} - Browserify", "No folders are found for a multi setup"




module.exports = Browserify
