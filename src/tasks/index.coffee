# NPM
path = require 'path'

# My Modules
Copy       = require './copy'
Less       = require './less'
Clean      = require './clean'
Watch      = require './watch'
Coffee     = require './coffee'
Logger     = require './logger'
Forever    = require './forever'
Project    = require './project'
Browserify = require './browserify'

# BrowserSync = require './browserSync'



class Tasks

	constructor: (@server) ->

		@load()


	load: ->

		# Setup project folders
		@folders()

		new Copy @server
		new Less @server
		new Clean @server
		new Watch @server
		new Coffee @server
		new Logger @server
		new Forever @server
		new Project @server
		new Browserify @server

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