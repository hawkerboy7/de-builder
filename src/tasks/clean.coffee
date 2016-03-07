# Node
fs = require 'fs'

# NPM
log   = require 'de-logger'
rmdir = require 'rmdir'



class Clean

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on 'builder:start', @start


	start: =>

		# Remove the client and server folders' content based on type
		if (@type = @server.config.type) is 1

			rmdir @server.folders.build.server, @handle
			rmdir @server.folders.build.client, @handle

		# Remove the build's folder content based on type
		if @type is 2 or @type is 3

			rmdir @server.folders.build.index, @handle


	handle: =>

		# Guard in case of type 1
		return @check = true if @type is 1 and not @check

		# Notify terminal
		log.info 'LDE - Clean', @server.symbols.finished

		# Notify clean status
		@server.vent.emit 'clean:done'



module.exports = Clean