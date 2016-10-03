# Node
path = require 'path'

# NPM
io  = require 'socket.io'
log = require 'de-logger'

# Modules
Handler = require './handler'



class SocketIO

	constructor: (@server) ->

		@load()


	load: ->

		return if not @server.config.io.enabled

		# Setupt socket sever
		@server.io = io()

			# Listen on the config provided ports
			.listen @server.config.io.port

		# Notify
		log.info 'LDE - Socket.io', "#{@server.config.title} events at #{@server.config.io.port}"

		# Listen for events
		@listeners()


	listeners: ->

		# Create a handler for each incomming socket connection
		@server.io.on 'connection', (socket) => new Handler socket: socket, server: @server

		# de-builder events for external applications
		@server.vent.on 'browserify:bundle', => @server.io.emit 'browserify:bundle'



module.exports = SocketIO
