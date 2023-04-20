# NPM
log = require "de-logger"

# Modules
Copy        = require "./copy"
Less        = require "./less"
Move        = require "./move"
Watch       = require "./watch"
Coffee      = require "./coffee"
Forever     = require "./forever"
Project     = require "./project"
Browserify  = require "./browserify"
BrowserSync = require "./browser-sync"



class Tasks

	constructor: (@server) ->

		@load()


	load: ->

		log.info "#{@server.config.title} - Tasks", "Initialize phase"

		# Only when running node build -prod do we need to create a temp folder
		@server.initialized = true if @server.run

		await new Project(@server).init()

		new Copy @server
		new Less @server
		new Move @server
		new Coffee @server
		new Forever @server
		await (new Browserify @server).init()
		await (new BrowserSync @server).init()
		await (new Watch @server).init()

		a = @server.less.process()
		b = @server.browserify.process()
		await a
		await b

		return if not await @server.move.process()

		if not (@server.run and @server.config.forever.enabled and @server.config.type isnt 3)
			return await @server.watch.close()

		@server.initialized = true
		@server.phaseOneDone = true

		log.info "#{@server.config.title} - Tasks", "Running phase"

		@server.forever.run()



module.exports = Tasks
