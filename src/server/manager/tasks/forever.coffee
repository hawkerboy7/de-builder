# --------------------------------------------------
#	Forever ~ Syncs connected browsers with latest files
# --------------------------------------------------
fs		= require 'fs'
log		= require 'de-logger'
forever	= require 'forever-monitor'


class Forever

	constructor: (@server) ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		@path = "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}/#{@server.options.forever.file}"

		@create()


	create: ->

		@child = new (forever.Monitor) @path,
			max:			1
			watch:			false
			killTree:		true
			spinSleepTime:	1000

		@child.on 'exit:code', (code) =>
			log.warn 'LDE - Forever', "Exit code: #{code}. #{@server.options.build}/#{@server.options.server}/#{@server.options.forever.file}"


	start: ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		# Stop previous running proccess
		@stop() if @started is true

		# Check if file exists before running the bundle
		fs.exists @path, (bool) =>

			# Don't build bundle due to lack of entry file
			return log.warn 'LDE - Forever', 'Entry file doesn\'t exist', @path.replace "#{@server.options.root}/", '' unless bool

			# Show server
			@started = true

			# Start server
			@child.start()


	stop: ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		# Stop child
		@child.stop()

		# Create new child
		@create()

		# Ready for new start
		@started = false



module.exports = Forever