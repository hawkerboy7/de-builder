# --------------------------------------------------
#	Forever ~ Syncs connected browsers with latest files
# --------------------------------------------------
fs		= require 'fs'
log		= require 'de-logger'
forever	= require 'forever-monitor'


class Forever

	constructor: (@server) ->

		@path = "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}/#{@server.options.app}"

		@child = new (forever.Monitor) @path,
			max:			1
			watch:			false
			killTree:		true
			spinSleepTime:	1000

		@child.on 'exit:code', (code) =>
			log.warn 'LDE - Forever', "Exit code: #{code}. #{@server.options.build}/#{@server.options.server}/#{@server.options.app}"


	start: ->

		# Check if file exists before running the bundle
		fs.exists @path, (bool) =>

			# Don't build bundle due to lack of entry file
			return log.warn 'LDE - Forever', 'Entry file doesn\'t exist', @path unless bool

			# Start server
			@child.start()


	stop: ->

		@child.stop()



module.exports = Forever