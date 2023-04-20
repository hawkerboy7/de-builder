# Node
fs   = require "fs-extra"
path = require "path"

# NPM
log        = require "de-logger"
pugify     = require "pugify"
uglifyify  = require "@browserify/uglifyify"
browserify = require "browserify"



class Browserify

	constructor: (@server) ->

		@server.browserify = process: @process


	init: ->

		new Promise (resolve) =>

			if @server.config.type isnt 2
				await @load()
				@initialize()

			resolve()


	load: ->

		new Promise (resolve) =>

			# Short reference to browserify config
			@config = @server.config.browserify

			# Store multi setup folders
			@folders = []

			# Determin source folder
			@sFolder = @server.folders.src.client
			@sFolder = @server.folders.src.index if @server.config.type is 3
			@sFolder += path.sep + @config.folder

			# Determin source file
			@sFile = @sFolder + path.sep + @config.single.entry

			type = "temp"
			type = "build" if @server.initialized

			# Determin build folder
			@bFolder = @server.folders[type].client
			@bFolder = @server.folders[type].index if @server.config.type is 3
			@bFolder += path.sep + @config.folder

			# Determin build file
			@bFile = @bFolder + path.sep + @config.single.entry.replace ".coffee", ".js"

			# Check if entry file exists
			try
				stats = fs.statSync @sFile
			catch e

			if e
				@type = "multi"
				await @determin()
			else
				@type = "single"

			log.info "#{@server.config.title} - Browserify", "Type: #{@type}"
			log.info "#{@server.config.title} - Browserify", "Uglify applied" if @server.uglify

			resolve()


	determin: ->

		new Promise (resolve) =>

			try
				files = await fs.readdir @sFolder
			catch e
				return log.error "#{@server.config.title} - Browserify", "Entry file not found: #{@sFile}\n", e.stack

			for file in files

				continue if not fs.statSync(folder = @sFolder + path.sep + file).isDirectory()

				@folders.push
					name : file
					path : @bFolder + path.sep + file

			if @folders.length is 0
				log.error "#{@server.config.title} - Browserify", "No folders are found for a multi setup"

			resolve()


	initialize: ->

		options =

			# Add source map on envs other than production when debug is true
			debug: @server.env isnt "production" and @config.debug

			# Do not show paths to files in the app.bundle.js
			fullPaths: false

		if @type is "single"

			bundle = @createBundle()

			# Create bundle stream
			@dFile = @bFolder + path.sep + @config.single.bundle

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
			@b.transform pugify.pug compileDebug: @server.env isnt "production"

			@b.transform uglifyify, sourceMap: false if @server.uglify

			# Store starting time
			@t = (new Date).getTime()


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
				@dFile[name] = @bFolder + path.sep + name + path.sep + @config.multi

				# Store browserify bundle
				@b[name] = browserify options

					# Add user entry file
					.add @bFolder + path.sep + folder.name + path.sep + "index.js"

					# Stream the bundle to a file write stream
					.on "bundle", @_bundle[name]

					# Handle error
					.on "error", ->

						console.log "\nDexter multi"
						console.log arguments

				# Allow for .pug files to be added into the bundle
				@b[name].transform pugify.pug compileDebug: @server.env isnt "production"

				@b[name].transform uglifyify, sourceMap: false if @server.uglify

		# Expose the bundle(s) for browser-sync
		@server.browserify.w = @b


	process: (file) =>

		new Promise (resolve) =>

			return resolve() if @server.config.type is 2

			log.info "#{@server.config.title} - Browserify", "Init" if not file

			if @type is "multi"
				await @multi file
			else if @type is "single"
				await @make()

			resolve()


	multi: (file) ->

		new Promise (resolve) =>

			return resolve() if @folders.length is 0

			list = {}

			for folder in @folders

				if file
					folderFile = file.split("/")[3]
					folderSrc = (items = folder.path.split("/"))[items.length - 1]
					continue if folderFile isnt folderSrc

				list[folder.name] = @make folder.name

			await promise for key, promise of list

			resolve()


	make: (name) ->

		new Promise (resolve) =>

			if name
				@t[name] = (new Date).getTime()
			else
				@t = (new Date).getTime()

			if name
				@b[name].bundle().on "end", resolve
			else
				@b.bundle().on "end", resolve


	createBundle: (name) ->

		bundle = (stream) =>

			message = ""
			message = "Bundle '#{name}' - " if name

			log.info "", "Building bundle '#{name}'"

			# Notify if mkdirp failed
			stream.on "error", (err) =>
				console.log "stream error"
				if err
					return log.error "#{@server.config.title} - Browserify", "\n#{message}Unable to creat bundle\n#{err.message}"

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
				dest = dFile.replace @server.root + path.sep, ""

				# Notify Browserify results
				log.info "#{@server.config.title} - Browserify", "#{message}#{dest} | #{@server.symbols.finished} #{time} s"

			destination = @dFile
			destination = @dFile[name] if name
			destination = destination.replace @server.root + path.sep, ""
			destination = @server.toDestination destination

			# Stream into the file
			stream.pipe fs.createWriteStream @server.root + path.sep + destination



module.exports = Browserify
