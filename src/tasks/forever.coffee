# NPM
log         = require 'de-logger'
{ Monitor } = require 'forever-monitor'



class Forever

	constructor: (@server) ->

		@listeners() if @server.config.forever.enabled and @server.config.type isnt 3


	listeners: ->

		@server.vent.on 'forever:file', @forever


	forever: =>

		# Determin the src directory
		src = @server.folder.index
		src = @server.folder.server if @server.config.type is 2

		# Create file path
		file = src+path.sep+@server.config.forever.file

		console.log "file: ", file

		# Kill previous child if it exists
		@child.exit() if @child

		# Create a monitor for starting a child process
		@child = new Monitor file, max: 1, killTree: true

		# Handle exit
		@child.on 'exit:code', (code) =>

			console.log arguments

			log.info "#{@server.config.title} - Forever stopped with code:", code

		# Start child process
		@child.start()


module.exports = Forever