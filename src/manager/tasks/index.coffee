# --------------------------------------------------
#   Tasks ~ Loads all tasks and makes them avaiable trough @server
# --------------------------------------------------
{ EventEmitter } = require 'events'

# My Modules
Copy             = require './copy'
Less             = require './less'
Clean            = require './clean'
Watch            = require './watch'
Coffee           = require './coffee'
Forever          = require './forever'
Browserify       = require './browserify'
FileSystem       = require './fileSystem'
BrowserSync      = require './browserSync'



class Tasks

	constructor: (@options) ->

		@load()


	load: ->

		# Create a server object which has an EventEmitter
		@server =
			ready:         null
			files:         {}
			events:        new EventEmitter
			symbols:
				start:     '•'
				finished:  '✔'
			options:       @options

		@server.copy       = new Copy       @server
		@server.clean      = new Clean      @server
		@server.watch      = new Watch      @server
		@server.coffee     = new Coffee     @server
		@server.fileSystem = new FileSystem @server

		# Don't add less, browserify, browser-sync if type is 2 (server only)
		if @server.options.type isnt 2
			@server.less        = new Less        @server
			@server.browserify  = new Browserify  @server
			@server.browserSync = new BrowserSync @server

		# Don't add forever if type is 3 (node-webkit)
		if @server.options.type isnt 3
			@server.forever = new Forever @server

		# Clean build folder
		@server.clean.start =>

			# Start watch
			@server.watch.start()



module.exports = Tasks