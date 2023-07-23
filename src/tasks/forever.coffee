# Node
path   = require "path"
{fork} = require "child_process"

# NPM
log = require "de-logger"



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

		# Ensure no previous instance is runnning
		await @terminate()

		# Determin the src directory
		src = @server.folders.build.server
		src = @server.folders.build.index if @server.config.type is 2

		# Create file path
		entry = src + path.sep + @server.config.forever.entry

		@child = fork entry, stdio: "pipe"

		@child.stdout.pipe process.stdout
		@child.stderr.pipe process.stderr

		@child.on "close", (code, signal) =>
			return if code is null
			log.info "#{@server.config.title} - Forever", "Process exit with code #{code}"


	terminate: =>

		new Promise (resolve) =>

			# No child to terminate
			return resolve() if not @child

			# Child has already stopped running
			return resolve() if @child.exitCode isnt null

			# Request the child to terminate, but kill it if it does not
			@child.kill "SIGKILL" if not @child.kill "SIGTERM"

			resolve()



module.exports = Forever
