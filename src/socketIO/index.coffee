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

		# Link the socket.io server to the express server
		@server.io = io().listen @server.config.io.port, @server.config.io.host

		# Notify
		log.info 'LDE - Socket.io', "#{@server.config.title} events at #{@server.config.io.host}:#{@server.config.io.port}"

		# Listen for events
		@listeners()


	listeners: ->

		# Create a handler for each incomming socket connection
		@server.io.on 'connection', (socket) => new Handler socket: socket, server: @server

		# de-builder events for external applications
		@server.vent.on 'project:done', => @server.io.emit 'project:done'



module.exports = SocketIO