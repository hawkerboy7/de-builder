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

		@load() if @server.config.browserSync.enabled


	load: ->

		# Create path to gfbrowser-sync file
		@filePath = @server.myRoot+path.sep+'build'+path.sep+'browser-sync.js'

		# Create browsersync server
		@bs = browserSync.create()

		# Set browsersync config
		@config =
			ui: port       : @server.config.browserSync.ui
			port           : @server.config.browserSync.server
			logLevel       : 'silent'
			logFileChanges : false

		# Initialize server
		@bs.init @config, (err) =>

			# Notify error
			return log.error "#{@server.config.title} - Browser-sync", "Couldn't start \n\n", err if err

			# Retreive browserify code
			@code()


	code: ->

		# Notify start
		log.info "#{@server.config.title} - Browser-sync", "Browser-sync server started"

		# Download file
		@download "http://localhost:#{@config.port}/browser-sync/browser-sync-client.#{version}.js", (err) =>

			# Notify start
			return log.error "#{@server.config.title} - Browser-sync", "Unable to get browser-sync .js file", err if err

			# Notify ready
			log.info "#{@server.config.title} - Browser-sync", "Ready at localhost:#{@config.ui.port}"


			### TODO: fix this ###

			# Make socket.io-client require'able
			@server.browserify.w.require 'socket.io-client', expose: 'socket.io-client'

			# Add socket.io-client trough a file
			@server.browserify.w.add path.resolve __dirname, '../socketIO/socket.io-client'

			# Add Browser-sync to the bundle
			@server.browserify.w.add @filePath


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


	reload: (path) ->

		# Notify start
		log.info "#{@server.config.title} - Browser-sync", "Reload", path.replace "#{@server.options.root}/", ''

		# Reload based on file path
		@bs.reload path



module.exports = BrowserSync