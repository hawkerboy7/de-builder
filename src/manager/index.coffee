# --------------------------------------------------
#	Manager ~ Check for --arguments or starts the Tasks
# --------------------------------------------------
log			= require 'de-logger'
path		= require 'path'

config		= require './config'

# My Modules
Tasks		= require './tasks'
Project		= require '../extra/project'
Validate	= require './config/validate'



class Manager

	constructor: (options) ->

		# Show / hide debug
		log.set debug: display: !!options?.debug

		# Set LDE options
		@options = Validate config, options

		# Set root folder
		@options.root = path.resolve './'

		# Clear screen
		log.clear()

		# Notify start of project
		log.info 'LDE', 'Live Development Environment started'

		# Build default project based on config and options
		new Project @options

		# Start tasks
		@tasks = new Tasks @options



module.exports = Manager