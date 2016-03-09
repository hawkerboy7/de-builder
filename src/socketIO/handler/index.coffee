# NPM
log = require 'de-logger'



class Handler

	constructor: ({@socket, @server}) ->

		# Notify
		log.event 'LDE - Socket.io', "External connection has been made id: #{@socket.id}"



module.exports = Handler