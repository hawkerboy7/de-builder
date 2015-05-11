# --------------------------------------------------
#	BrowserSync ~ Syncs connected browsers with latest files
# --------------------------------------------------
fs			= require 'fs'
log			= require 'de-logger'
http		= require 'http'
path		= require 'path'
mkdirp		= require 'mkdirp'
browserSync	= require 'browser-sync'
{ version }	= require '../../../../node_modules/browser-sync/package.json'



class BrowserSync

	constructor: (@server) ->

		@load()


	load: ->

		@filePath = path.resolve __dirname, '../../../../build/browser-sync.js'

		@bs = browserSync.create()

		@config =
			ui:
				port: 9000
			port: 9001
			logLevel: 'silent'
			logFileChanges: false

		@bs.init @config, (err, bs) =>

			# Notify error
			return log.error 'LDE - BrowserSync', 'Couldn\'t start BrowserSync \n\n', err if err

			# Retreive browserify code
			@code()


	code: ->

		# Notify start
		log.info 'LDE - BrowserSync', "BrowserSync Started"

		# Download file
		@download "http://127.0.0.1:#{@config.port}/browser-sync/browser-sync-client.#{version}.js", (err) =>

			# Notify start
			return log.error 'LDE - BrowserSync', "Unable to get browser-sync .js file", err if err

			# Notify ready
			log.info 'LDE - BrowserSync', "BrowserSync ready - localhost:#{@config.ui.port}"

			# Add Browser-sync to the bundle
			@server.browserify.w.add @filePath

			# Shows Browserify the browser sync file has been made
			@.ready = true

			# Trigger Browserify start
			@server.watch.browserify()


	download: (url, cb) ->

		mkdirp path.dirname(@filePath), (err) =>

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