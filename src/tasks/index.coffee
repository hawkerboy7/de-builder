# NPM
path = require 'path'

# My Modules
Copy    = require './copy'
Less    = require './less'
Clean   = require './clean'
Watch   = require './watch'
Coffee  = require './coffee'
Project = require './project'

# Forever     = require './forever'
# Browserify  = require './browserify'
# FileSystem  = require './fileSystem'
# BrowserSync = require './browserSync'



class Tasks

	constructor: (@server) ->

		@load()


	load: ->

		# Setup project folders
		@folders()

		@copy    = new Copy @server
		@less    = new Less @server
		@clean   = new Clean @server
		@watch   = new Watch @server
		@coffee  = new Coffee @server
		@project = new Project @server

		# @copy       = new Copy @server
		# @coffee     = new Coffee @server
		# @fileSystem = new FileSystem @server

		# Create a server object which has an EventEmitter
		# 	files:         {}

		# @server.copy       =
		# @server.clean      = new Clean      @server
		# @server.watch      = new Watch      @server
		# @server.coffee     = new Coffee     @server
		# @server.fileSystem = new FileSystem @server

		# # Don't add less, browserify, browser-sync if type is 2 (server only)
		# if @server.config.type isnt 2
		# 	@server.less        = new Less        @server
		# 	@server.browserify  = new Browserify  @server
		# 	@server.browserSync = new BrowserSync @server

		# # Don't add forever if type is 3 (node-webkit)
		# if @server.config.type isnt 3
		# 	@server.forever = new Forever @server

		# # Clean build folder
		# @server.clean.start =>

		# 	# Start watch
		# 	@server.watch.start()

		@server.vent.emit 'builder:start'


	folders: ->

		@server.folders =
			src:
				index: src = "#{@server.root}#{path.sep}#{@server.config.src}"
				server: "#{src}#{path.sep}#{@server.config.server}"
				client: "#{src}#{path.sep}#{@server.config.client}"
			build:
				index: build = "#{@server.root}#{path.sep}#{@server.config.build}"
				server: "#{build}#{path.sep}#{@server.config.server}"
				client: "#{build}#{path.sep}#{@server.config.client}"



module.exports = Tasks