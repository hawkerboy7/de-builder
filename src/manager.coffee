# --------------------------------------------------
# Start Application
# --------------------------------------------------

# NPM
log = require "de-logger"

# Modules
Exit   = require "./exit"
Tasks  = require "./tasks"
Server = require "./server"



# --------------------------------------------------
# Application Manager | Starts all main processes
# --------------------------------------------------
class Manager

	constructor: (config) ->

		# Clear screen
		log.clear()

		# Initialize by creating a server the server
		server = new Server config

		# Handle program exit
		new Exit server

		# Startup all de-builder tasks
		new Tasks server



module.exports = Manager
