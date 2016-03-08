# Node
fs          = require 'fs'
http        = require 'http'
path        = require 'path'

# NPM
log         = require 'de-logger'
mkdirp      = require 'mkdirp'
browserSync = require 'browser-sync'
{ version } = require 'browser-sync/package.json'



class BrowserSync

	constructor: (@server) ->

		@load()


	load: ->

		# Create path to gfbrowser-sync file
		@filePath = @server.myRoot+path.sep+'build'+path.sep+'browser-sync.js'

		# Create browsersync server
		@bs = browserSync.create()

		# Set browsersync config
		@config =
			ui:
				port: @server.config.browserSync.ui
			port: @server.config.browserSync.server
			logLevel: 'silent'
			logFileChanges: false

		# Initialize server
		@bs.init @config, (err) =>

			# Notify error
			return log.error 'LDE - BrowserSync', 'Couldn\'t start BrowserSync \n\n', err if err

			# Retreive browserify code
			@code()


	reload: (path) ->

		# Notify start
		log.info 'LDE - BrowserSync', "Reload", path.replace "#{@server.options.root}/", ''

		# Reload based on file path
		@bs.reload path


	code: ->

		# Notify start
		log.info 'LDE - BrowserSync', "BrowserSync server started"

		# Download file
		@download "http://localhost:#{@config.port}/browser-sync/browser-sync-client.#{version}.js", (err) =>

			# Notify start
			return log.error 'LDE - BrowserSync', "Unable to get browser-sync .js file", err if err

			# Notify ready
			log.info 'LDE - BrowserSync', "Ready at localhost:#{@config.ui.port}"

			if @server.options.browserSync.enabled

				# Make socket.io-client require'able
				@server.browserify.w.require 'socket.io-client', expose: 'socket.io-client'

				# Add socket.io-client trough a file
				@server.browserify.w.add path.resolve __dirname, '../../helper/socket.io-client'

				# Add Browser-sync to the bundle
				@server.browserify.w.add @filePath

			# Shows Browserify the browser sync file has been made
			@.ready = true

			# Trigger Browserify start
			@server.watch.browserify()


	download: (url, cb) ->

		mkdirp path.dirname(@filePath), =>

			# Store in a file
			@file = fs.createWriteStream @filePath

			# Download file with http
			http.get url, (response) =>

				response.pipe @file

					.on 'error', (err) =>
						fs.unlink @file
						cb err
					.on 'finish', =>
						@file.close cb



module.exports = BrowserSync