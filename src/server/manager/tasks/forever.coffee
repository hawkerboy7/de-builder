# --------------------------------------------------
#	Forever ~ Syncs connected browsers with latest files
# --------------------------------------------------
log		= require 'de-logger'
forever	= require 'forever-monitor'


class Forever

	constructor: (@server) ->

		restarts = 3

		@path = "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}/#{@server.options.app}"

		@child = new (forever.Monitor) @path,
			max:			restarts
			watch:			false
			killTree:		true
			spinSleepTime:	1000

		@child.on 'exit:code', (code) =>
			log.warn 'LDE - Forever', "Exit code: #{code}. #{@server.options.build}/#{@server.options.server}/#{@server.options.app}"


	start: ->

		@child.start()


	stop: ->

		@child.stop()



module.exports = Forever