# --------------------------------------------------
#   BrowserSync ~ Syncs connected browsers with eachother and with the compiled files
# --------------------------------------------------
fs          = require 'fs'
log         = require 'de-logger'
http        = require 'http'
path        = require 'path'
mkdirp      = require 'mkdirp'
browserSync = require 'browser-sync'
{ version } = require 'browser-sync/package.json'



class BrowserSync

	constructor: (@server) ->

		@load()


	load: ->

		@filePath = path.resolve __dirname, '../../../build/browser-sync.js'

		@bs = browserSync.create()

		@config =
			ui:
				port: 9000
			port: 9001
			logLevel: 'silent'
			logFileChanges: false

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