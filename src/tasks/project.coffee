# Node
path = require "path"

# NPM
log    = require "de-logger"
mkdirp = require "mkdirp"



class Project

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "clean:done", @setup


	setup: =>

		@i = 0

		return @typeOne() if @server.config.type is 1

		@typeTwo()


	typeOne: ->

		mkdirp(@server.folders.src.client).then @handle
		mkdirp(@server.folders.src.server).then @handle
		mkdirp(@server.folders.build.client).then @handle
		mkdirp(@server.folders.build.server).then @handle


	typeTwo: ->

		mkdirp(@server.folders.src.index).then @handle
		mkdirp(@server.folders.build.index).then @handle


	handle: =>

		@i++

		if (@server.config.type is 1 and @i is 4) or ((@server.config.type is 2 or @server.config.type is 3) and @i is 2)

			# Notify project type
			log.info "LDE - Project", @explaination()

			# Send event
			@server.vent.emit "project:done"


	explaination: ->

		type = @server.config.type

		message = "Project type \""
		message += "Server-Client" if type is 1
		message += "Server"        if type is 2
		message += "Client"        if type is 3
		message += "\" is used"



module.exports = Project
