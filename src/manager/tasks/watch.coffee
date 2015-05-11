# --------------------------------------------------
#	Watch ~ Watched all relevant LDE files
# --------------------------------------------------
log			= require 'de-logger'
path		= require 'path'
chokidar	= require 'chokidar'



class Watch

	constructor: (@server) ->


	start: ->

		# Notify start of the watch
		log.info 'LDE - Watch', "~ Night gathers, and now my watch begins ~"

		# Source file to watch
		@src	= "#{@server.options.root}/#{@server.options.src}"
		@build	= "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.browserify.folder}"
		@build2	= "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}"

		@buildTypeTwo = "#{@server.options.root}/#{@server.options.build}/"

		# Start wachter
		@watcher()


	watcher: ->

		# Watch source
		chokidar
			.watch @src, ignored: /[\/\\]\./
			.on 'add', (filePath) => @check filePath
			.on 'change', (filePath) => @check filePath
			.on 'unlink', (filePath) => @remove filePath
			.on 'ready', =>
				setTimeout(=>
					@server.ready = true
					@browserify() if @server.options.type is 1
					@forever()
				,200)

		# Watch forever build
		chokidar
			.watch @build2 , ignored: /[\/\\]\./
			.on 'change', (filePath)	=> @forever()
			.on 'unlink', (filePath)	=> @forever()

		if @server.options.type is 1

			# Watch browserify build
			chokidar
				.watch @build, ignored: [ /[\/\\]\./, "#{@build}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
				.on 'add', (filePath)		=> @browserify()
				.on 'change', (filePath)	=> @browserify()
				.on 'unlink', (filePath)	=> @browserify()


	check: (filePath) ->

		# Get extention
		extention = path.extname filePath

		# Notify
		log.debug 'LDE - Watch', "Add/Change: " + filePath.replace "#{@server.options.root}/", ''

		# Compile specific extentions
		return @server.less.compile filePath	if extention is '.less'
		return @server.coffee.compile filePath	if extention is '.coffee'

		# Copy files in case no extention is recognized
		@server.copy.compile filePath


	remove: (filePath) ->

		console.log 'Remove file in the build folder?: ', filePath


	browserify: ->

		# Don't start unless src watch is ready (and also 'probably' fully compiled)
		return unless @server.ready

		return unless @server.browserSync.ready

		# Notify
		log.debug 'LDE - Watch', "Browserify triggered"

		# Compile browserify
		@server.browserify.compile()


	forever: ->

		# Don't start unless src watch is ready (and also 'probably' fully compiled)
		return unless @server.ready

		# Notify
		log.debug 'LDE - Watch', "Forever triggered"

		# Start server with forever
		@server.forever.start()



module.exports = Watch