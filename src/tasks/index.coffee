# NPM
path = require 'path'

# My Modules
Copy    = require './copy'
Less    = require './less'
Clean   = require './clean'
Watch   = require './watch'
Coffee  = require './coffee'
Forever = require './forever'
Project = require './project'

# Browserify  = require './browserify'
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
		@forever = new Forever @server
		@project = new Project @server

		# Don't add less, browserify, browser-sync if type is 2 (server only)
		# if @server.config.type isnt 2
		# 	@server.browserify  = new Browserify  @server
		# 	@server.browserSync = new BrowserSync @server

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