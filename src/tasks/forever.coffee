# Node
path = require "path"

# NPM
log     = require "de-logger"
nodemon = require "nodemon"



class Forever

	constructor: (@server) ->

		@listeners()
		@server.forever = run: @start


	listeners: ->

		process.on "exit", @exit


	exit: (code) =>

		log.info "#{@server.config.title} - Watch", "~ And Now My Watch Is Ended ~"

		@terminate()


	start: =>

		# Determin the src directory
		src = @server.folders.build.server
		src = @server.folders.build.index if @server.config.type is 2

		# Create file path
		entry = src + path.sep + @server.config.forever.entry

		# --------------------------------------------------
		# Due to issues with nodemon we run everything a bit slower to hopefully
		# let the async parts complete
		# - TypeError: Cannot read properties of undefined (reading 'script')
		# - [not solved] MaxListenersExceededWarning: Possible EventEmitter memory leak detected
		# --------------------------------------------------

		# Ensure no previous instance is runnning
		await @terminate()

		# Ensure we work with a clean slate of nodemon
		nodemon.reset()

		# Wait a small time to ensure the reset is completed and possibly also
		# for the the entry file being flushed to disk. 100ms seems to be enough after some testing
		await new Promise (resolve) => setTimeout resolve, 100

		# Start running the application
		nodemon
			script: entry,
			ext: "js"
			ignore: ["*"]


	terminate: =>

		# Close the currently running app in case it is running
		nodemon.emit "SIGINT"
		nodemon.emit "quit"

		# Allow a little time for the application run by nodemon to close
		new Promise (resolve) => setTimeout resolve, 10



module.exports = Forever
