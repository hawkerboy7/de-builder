# Node
path             = require 'path'
{ EventEmitter } = require 'events'

# NPM
_      = require 'lodash'
log    = require 'de-logger'
extend = require 'deep-extend'

# Config
cfg = require './config'
pkg = require '../../package.json'



class Server

	constructor: (config) ->

		# Set package
		@pkg    = pkg

		# Extend config with provided config
		@config = extend cfg, config

		# Set title of the process
		process.title = @pkg.name

		# Determin application environment
		@env = process.env.NODE_ENV || 'development'

		# Set debug
		log.set debug: display: @config.debug

		# Notify start of project
		log.info @config.title , "#{@config.fullTitle} (#{@config.title}) started in: #{@env}"
		log.info @config.title , "Process title: #{@pkg.name}"

		# Load server
		@load()


	load: (cb) ->

		# Store symbols
		@symbols =
			start    : '•'
			finished : '✔'

		# Set the root folder of the project that de-builder is working for
		@root = path.resolve './'

		# Root of de-builder
		@myRoot = path.resolve __dirname, '../../'

		# Set an event emitter
		@vent = new EventEmitter

		# Turn src path to build path
		@toBuild = (file) =>

			# Seperate path
			seperated = file.split path.sep

			# Remove first entry (src folder)
			seperated.shift()

			# File to remove in the build folder
			@config.build+path.sep+seperated.join path.sep



module.exports = Server