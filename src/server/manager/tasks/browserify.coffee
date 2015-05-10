# --------------------------------------------------
#	Browserify ~ Bundles all client .js and .jade files
# --------------------------------------------------
fs			= require 'fs'
path		= require 'path'
log			= require 'de-logger'
jadeify		= require 'jadeify'
watchify	= require 'watchify'
browserify	= require 'browserify'



class Browserify

	constructor: (@server) ->

		@path = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.browserify.folder}"
		@name = "#{@path}/#{@server.options.browserify.file}".replace '.js', '.bundle.js'
		@entry = "#{@path}/#{@server.options.browserify.file}"

		options =

			# Watchify
			cache:			{}
			packageCache:	{}

			# Browserify
			debug:			true
			# noparse:		true # USE THIS FOR nw-de-base
			fullPaths:		false
			detectGlobals:	false

		@w = watchify browserify options

			# Add user entry file
			.add @entry

			# Allow for .jade files to be added into the bundle
			.transform jadeify, runtimePath: require.resolve 'jade/runtime'

			# Stream the bundle to a file write stream
			.on 'bundle', (stream) => @write stream


	compile: ->

		# Check if file exists before running the bundle
		fs.exists @entry, (bool) =>

			# Don't build bundle due to lack of entry file
			return log.warn 'LDE - Browserify', 'Entry file doesn\'t exist', @entry.replace "#{@server.options.root}/", '' unless bool

			# Create bundle stream
			@file = fs.createWriteStream @name

			# Notify succes
			log.info "LDE - Browserify", "#{@server.symbols.start} #{@name}".replace "#{@server.options.root}/", ''

			@s = new Date()

			# Create the bundle
			@w.bundle()


	write: (stream) ->

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



module.exports = Browserify