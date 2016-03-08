# Node
path = require 'path'

# NPM
log         = require 'de-logger'
{ Monitor } = require 'forever-monitor'



class Forever

	constructor: (@server) ->

		@listeners() if @server.config.forever.enabled and @server.config.type isnt 3


	listeners: ->

		@server.vent.on 'compiled:file', @forever
		@server.vent.on 'watch:initialized', @initialized


	initialized: =>

		# Indicate that the application is initialized
		@init = true

		# Start forever
		@forever()


	forever: (args) =>

		return if not @init

		# get file if it exists
		file = args?.file

		return @start() if not file

		build = @server.folders.build.server
		build = @server.folders.build.index if @server.config.type is 2

		# Restart the server on any file change in the src
		return if path.extname(file) is '.jade' or -1 is file.indexOf build

		@start()


	start: ->

		# Determin the src directory
		src = @server.folders.build.server
		src = @server.folders.build.index if @server.config.type is 2

		# Create file path
		entry = src+path.sep+@server.config.forever.entry

		# Kill previous child if it exists
		@child.kill() if @child

		# Create a monitor for starting a child process
		@child = new Monitor entry, max: 1, killTree: true

		# Handle exit
		@child.on 'exit:code', (code) =>

			log.warn "#{@server.config.title} - Forever stopped with code: #{code}" if code

		# Start child process
		@child.start()



module.exports = Forever