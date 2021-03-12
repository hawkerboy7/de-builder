# Node
fs          = require "fs"
http        = require "http"
path        = require "path"

# NPM
log         = require "de-logger"
mkdirp      = require "mkdirp"
browserSync = require "browser-sync"
{ version } = require "browser-sync/package.json"



class BrowserSync

	constructor: (@server) ->

		return if false or
			not @server.config.browserSync.enabled or
			@server.config.type is 2 or
			@server.env is "production"

		@load()
		@listeners()


	load: ->

		@config = @server.config.browserSync

		# Create path to gf browser-sync file
		@filePath = @server.myRoot+path.sep+"build"+path.sep+"browser-sync.js"

		# Create browsersync server
		@bs = browserSync.create()

		# Set browsersync config
		config =
			ui: port       : @config.ui
			port           : @config.server
			logLevel       : "silent"
			ghostMode      : false
			logFileChanges : false

		# Initialize server
		@bs.init config, (err) =>

			# Notify error
			return log.error "#{@server.config.title} - Browser-sync", "Could not start \n\n", err if err

			# Retreive browserify code
			@code()


	listeners: ->

		@server.vent.on "browserify:initialized", @initialized
		@server.vent.on "browserify:bundle", @bundle
		@server.vent.on "compiled:file", @reload


	initialized: (w) =>

		@init = true

		# Check if multi or single
		if w._browserSyncIndicator

			added = false

			for folder in @config.multi

				continue if not bundle = w[folder]

				added = true

				# # Make socket.io-client require'able
				# bundle.require "socket.io-client", expose: "socket.io-client"

				# Add socket.io-client trough a file
				bundle.add path.resolve __dirname, "../socketIO/socket.io-client"

				# Add Browser-sync to the bundle
				bundle.add @filePath

			log.warn "#{@server.config.title} - Browser-sync", "browser-sync was not added" if not added

		else

			# # Make socket.io-client require"able
			# w.require "socket.io-client", expose: "socket.io-client"

			# Add socket.io-client trough a file
			w.add path.resolve __dirname, "../socketIO/socket.io-client"

			# Add Browser-sync to the bundle
			w.add @filePath


	code: ->

		# Notify start
		log.info "#{@server.config.title} - Browser-sync", "Browser-sync server started"

		# Download file
		@download "http://localhost:#{@config.server}/browser-sync/browser-sync-client.js?v=#{version}", (err) =>

			# Notify start
			return log.error "#{@server.config.title} - Browser-sync", "Unable to get browser-sync .js file", err if err

			# Notify ready
			log.info "#{@server.config.title} - Browser-sync", "UI ready at localhost:#{@config.ui}"


	download: (url, cb) ->

		mkdirp(path.dirname(@filePath)).then =>

			# Store in a file
			@file = fs.createWriteStream @filePath

			# Download file with http
			http.get url, (response) =>

				response.pipe @file

					.on "error", (err) =>
						fs.unlink @file
						cb err
					.on "finish", =>
						@file.close cb


	reload: ({file}) =>

		return if not @init

		@_reload file if ".css" is path.extname file


	bundle: (file) =>

		@_reload file


	_reload : (file) ->

		# Notify start
		log.info "#{@server.config.title} - Browser-sync", "Reload", file.replace "#{@server.root}/", ""

		# Reload based on file path
		@bs.reload file



module.exports = BrowserSync
