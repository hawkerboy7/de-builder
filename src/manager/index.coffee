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

	constructor: (options, start) ->

		# Block debug
		log.set debug: display: false

		# Clear screen
		log.clear() unless start

		# Notify start of project
		log.info 'LDE', 'Live Development Environment started'

		# Set LDE options
		@options = Validate config, options

		# Set root folder
		@options.root = path.resolve './'

		# Build default project based on config and options
		return new Project @options if start

		# Asumes folders have been made (add a check for this OR the Project functionaly tweaked a little)

		# Start tasks
		@tasks = new Tasks @options



module.exports = Manager