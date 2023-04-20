# Node
http = require "http"
path = require "path"

# NPM
fs          = require "fs-extra"
log         = require "de-logger"
{version}   = require "browser-sync/package.json"
browserSync = require "browser-sync"



class BrowserSync

	constructor: (@server) ->

		@server.browserSync = process: @process


	init: ->

		new Promise (resolve) =>

			return resolve() if (not @server.config.browserSync.enabled) or
				@server.config.type is 2 or
				@server.env is "production"

			await @load()
			await @code()
			await @add()
			resolve()


	load: ->

		new Promise (resolve) =>

			@config = @server.config.browserSync

			# Create path to gf browser-sync file
			@filePath = @server.myRoot + path.sep + "build" + path.sep + "browser-sync.js"

			# Create browsersync server
			@bs = browserSync.create()

			# Set browsersync config
			config =
				ui: port       : @config.ui
				port           : @config.server
				logLevel       : "silent"
				ghostMode      : false
				logFileChanges : false

			@bs.init config, (err) =>

				log.error "#{@server.config.title} - Browser-sync", "Could not start \n\n", err if err

				resolve()


	code: ->

		new Promise (resolve) =>

			log.info "#{@server.config.title} - Browser-sync", "Browser-sync server started"

			@download "http://localhost:#{@config.server}/browser-sync/browser-sync-client.js?v=#{version}", (err) =>

				if err
					log.error "#{@server.config.title} - Browser-sync", "Unable to get browser-sync .js file", err
				else
					log.info "#{@server.config.title} - Browser-sync", "UI ready at localhost:#{@config.ui}"

				resolve()


	add: =>

		# Check if multi or single
		if @server.browserify.w._browserSyncIndicator

			added = false

			for folder in @config.multi

				continue if not bundle = @server.browserify.w[folder]

				added = true

				# Make socket.io-client require'able
				bundle.require "socket.io-client", expose: "socket.io-client"

				# Add socket.io-client trough a file
				bundle.add path.resolve __dirname, "../socketIO/socket.io-client"

				# Add Browser-sync to the bundle
				bundle.add @filePath

			log.warn "#{@server.config.title} - Browser-sync", "browser-sync was not added" if not added

		else

			# Make socket.io-client require"able
			@server.browserify.w.require "socket.io-client", expose: "socket.io-client"

			# Add socket.io-client trough a file
			@server.browserify.w.add path.resolve __dirname, "../socketIO/socket.io-client"

			# Add Browser-sync to the bundle
			@server.browserify.w.add @filePath


	download: (url, cb) ->

		fs.mkdirp(path.dirname(@filePath)).then =>

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


	process : (file) =>

		# Notify start
		log.info "#{@server.config.title} - Browser-sync", "Reload", file

		# Reload based on file path
		@bs.reload file



module.exports = BrowserSync
