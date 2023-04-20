# Node
path           = require "path"
{EventEmitter} = require "events"

# NPM
log    = require "de-logger"
extend = require "deep-extend"

# Config
cfg = require "./config"
pkg = require "../../package.json"



class Server

	constructor: (config) ->

		# Set package
		@pkg = pkg

		# Extend config with provided config
		@config = extend cfg, config

		# Set project info
		@config.title     = "LDE"
		@config.fullTitle = "Live Development Environment"

		# Set title of the process
		process.title = @pkg.name

		# Set the value of debug messages logged
		log.set debug: display: @config.debug

		# Check all provided arguments
		@argv()

		# Notify start of project
		log.info @config.title , "#{@config.fullTitle} (#{@config.title}) started in: #{@env}"
		log.info @config.title , "Process title: #{@pkg.name}"

		# Load server
		@load()


	load: (cb) ->

		# Store symbols
		@symbols =
			start    : "•"
			finished : "✔"

		# Set the root folder of the project that de-builder is working for
		@root = path.resolve "./"

		# Root of de-builder
		@myRoot = path.resolve __dirname, "../../"

		# Set an event emitter
		@vent = new EventEmitter

		# From src to temp or build foler
		@toDestination = (file) =>

			# Seperate path
			seperated = file.split path.sep

			# Remove first entry (src folder)
			seperated.shift()

			# File to remove in the build folder
			@config[if @initialized then "build" else "temp"] + path.sep + seperated.join path.sep


	argv: ->

		# Default values
		@env = "development"
		@run = true

		for arg in process.argv

			continue if arg[0] isnt "-"

			if arg is "-prod"
				@env = "production"
				@run = false
				@uglify = true
				continue

			if arg is "-debug"
				log.set debug: display: true
				continue

			if arg is "-uglify"
				uglify = true
				continue

			if arg is "-no-uglify"
				uglify = false
				continue

			run = true if arg is "-run"

		# Ensure the order of -prod and -run does not matter
		@run = true if run

		# Allow for overwriting the uglify setting when running in any environment
		@uglify = uglify if uglify?



module.exports = Server
