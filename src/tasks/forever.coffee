# Node
path = require "path"

# NPM
log     = require "de-logger"
nodemon = require "nodemon"



class Forever

	constructor: (@server) ->

		@listeners() if @server.config.forever.enabled and @server.config.type isnt 3


	listeners: ->

		@server.vent.on "terminate:child", @terminate
		@server.vent.on "compiled:file", @forever
		@server.vent.on "watch:initialized", @initialized


	initialized: =>

		# Indicate that the application is initialized
		@init = true

		# Start forever
		@forever()


	forever: (args) =>

		return if not @init

		# Get file if it exists
		file = args?.file

		return @start() if not file

		build = @server.folders.build.server
		build = @server.folders.build.index if @server.config.type is 2

		# Restart the server on any file change in the src
		return if -1 is file.indexOf build

		@start()


	start: ->

		# Prevent running the script so the process can close when finished
		return if not @server.run

		# Determin the src directory
		src = @server.folders.build.server
		src = @server.folders.build.index if @server.config.type is 2

		# Create file path
		entry = src+path.sep+@server.config.forever.entry

		# Ensure no previous instance is runnning
		@terminate()

		# Ensure we work with a clean slate of nodemon
		nodemon.reset()

		# Start running the application
		nodemon
			script: entry,
			ext: "js"
			ignore: ["*"]


	terminate: =>

		# Close the currently running app in case it is running
		nodemon.emit "quit"



module.exports = Forever
