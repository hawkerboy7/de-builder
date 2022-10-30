# NPM
log = require "de-logger"



class Exit

	constructor: (@server)->

		@listeners()


	listeners: ->

		process.on "exit", @exit
		process.on "SIGINT", @sigint
		process.on "SIGTERM", @sigterm
		process.on "command", @command
		process.on "uncaughtException", @uncaughtException


	exit: (code) =>

		@server.vent.emit "terminate:child"

		log.info @server.config.title, "Exit:", code


	uncaughtException: (e) =>
		console.log ""
		log.warn @server.config.title, "Uncaught Exception Found\n\n", e.stack


	sigint: =>
		console.log ""
		log.info @server.config.title, "Application Interrupted"
		process.exit 130


	sigterm: =>
		console.log ""
		log.info @server.config.title, "Application Terminated"
		process.exit 143


	command: (command) ->

		# Exit process
		process.exit() if command is "exit"

		# Log command
		# log.event "command", command



module.exports = Exit
