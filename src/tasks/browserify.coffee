# Node
fs   = require 'fs'
path = require 'path'

# NPM
log        = require 'de-logger'
jadeify    = require 'jadeify'
watchify   = require 'watchify'
browserify = require 'browserify'



class Browserify

	constructor: (@server) ->

		return if (@type = @server.config.type) is 2

		@setup()
		@listeners()


	setup: ->

		# Short reference to browserify config
		@config = @server.config.browserify

		# Store multi setup folders
		@folders = []

		# Src
		@folder = @server.folders.src.client
		@folder = @server.folders.src.index if @type is 2
		@folder += path.sep+@config.folder
		@entry  = @folder+path.sep+@config.entry

		# Build
		@destination = @server.folders.build.client
		@destination = @server.folders.build.index if @type is 2
		@destination += path.sep+@config.folder

		# Check if entry file exists
		fs.stat @entry, (e) =>

			if not e
				@type = 'single'
			else
				@type = 'multi'
				@determin()

			log.info "#{@server.config.title} - Browserify", "Type: #{@type}"


	determin: ->

		log.debug "#{@server.config.title} - Browserify", "Entry file not found: #{@entry}"

		# Read all files in entry folder
		fs.readdir @folder, (e, files) =>

			return log.error "#{@server.config.title} - Browserify", e if e

			# Loop over all results
			for file in files

				# Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
				continue if not fs.statSync(folder = @folder+path.sep+file).isDirectory()

				# Add less bundle folders
				@folders.push
					name  : file
					build : @destination+path.sep+file

			@error() if @folders.length is 0


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
			debug:        @server.options.browserify.debug

			# Don't show paths to files in the app.bundle.js
			fullPaths:    false

		if @type is 'single'

			# Create bundle stream
			@f = fs.createWriteStream @destination+path.sep+@config

			# Store watchify browserify bundle
			@w = watchify browserify options

				# Add user entry file
				.add @entry

				# Allow for .jade files to be added into the bundle
				.transform jadeify, runtimePath: require.resolve 'jade/runtime'

				# Stream the bundle to a file write stream
				.on 'bundle', @single

		if @type is 'multi'

			# Store write streams
			@f = {}

			# Store watchify browserify bundles
			@w = {}

			for folder in @folders

				@f[folder.name] = fs.createWriteStream @name
				@w[folder.name] = watchify browserify options




	check: (arg) =>

		file = arg?.file

		return if not @init

		# Comple a single bundle if multiple bundles are not required
		if @type is 'single'
			@make()

		# Compile one (or all) of the multiple bundles
		if @type is 'multi'

			@multi file


	multi: (file) ->

		return @error() if @folders.length is 0

		for folder in @folders

			(continue if -1 is file.indexOf folder.build) if file

			@make()


	make: () ->



	single: (stream) ->

		# Stream into the file
		stream.pipe @file

		# Notify if mkdirp failed
		stream.on 'error', (err) ->
			return log.error 'LDE - Browserify', "Unable to creat bundle \n\n", err if err

		# Notify succes
		stream.on 'end', =>

			# Calculate time differenve from the start of browserify
			time = (new Date().getTime()-@s.getTime())/1000

			# Notify Browserify results
			log.info "LDE - Browserify", "#{@server.symbols.finished} #{time} s"

			# Reload browser sync iwht a new less file
			@server.browserSync.reload @name


	error: ->

		log.error "#{@server.config.title} - Browserify", "No folders are found for a multi setup"




module.exports = Browserify