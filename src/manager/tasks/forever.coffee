# --------------------------------------------------
#   Forever ~ Starts your server
# --------------------------------------------------
fs      = require 'fs'
log     = require 'de-logger'
forever = require 'forever-monitor'


class Forever

	constructor: (@server) ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		sub = '/'
		sub = "/#{@server.options.server}/" if @server.options.type isnt 2

		@path = "#{@server.options.root}/#{@server.options.build}#{sub}#{@server.options.forever.file}"

		@create()
		@listener()


	create: ->

		@child = new (forever.Monitor) @path,
			max:      1
			watch:    false
			killTree: true

		@child.on 'exit:code', (code) =>

			return if code is null

			log.warn 'LDE - Forever', "Exit code: #{code}. #{@server.options.build}/#{@server.options.server}/#{@server.options.forever.file}"


	start: ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		# Check if file exists before running the bundle
		fs.exists @path, (bool) =>

			# Don't build bundle due to lack of entry file
			return log.warn 'LDE - Forever', 'Entry file doesn\'t exist', @path.replace "#{@server.options.root}/", '' unless bool

			# Restart if process was once started already and is running
			return @child.restart() if @child.running

			# Start server
			@child.start()


	listener: ->

		process.on 'exit', ->

			log.info 'LDE - System', 'Shutting down due to exit'

			@child.kill() if @child

			process.exit()


		process.on 'uncaughtException', (e) ->

			log.warn 'LDE - System', 'UncaughtException', e






module.exports = Forever