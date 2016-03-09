# --------------------------------------------------
# Start Application
# --------------------------------------------------

# NPM
log = require 'de-logger'

# Modules
Exit     = require './exit'
Tasks    = require './tasks'
Server   = require './server'
SocketIO = require './socketIO'

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

		# Start Socket server
		new SocketIO server

		# Startup all de-builder tasks
		new Tasks server



module.exports = Manager