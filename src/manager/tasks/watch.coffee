# --------------------------------------------------
#	Watch ~ Watches all relevant LDE files
# --------------------------------------------------
log			= require 'de-logger'
path		= require 'path'
chokidar	= require 'chokidar'



class Watch

	constructor: (@server) ->


	start: ->

		# Notify start of the watch
		log.info 'LDE - Watch', "~ Night gathers, and now my watch begins ~"

		sub = ""

		sub = "#{@server.options.server}/" if @server.options.type isnt 2

		# Source file to watch
		@src				= "#{@server.options.root}/#{@server.options.src}/"

		@foreverRestart		= "#{@server.options.root}/#{@server.options.build}/#{sub}"
		@browserifyRebuild	= "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.browserify.folder}/"
		@browserifyServer	= "#{@server.options.root}/#{@server.options.build}/#{@server.options.browserify.folder}/"

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

				# Start watching the build after CLEAN is finished
				@watcher2()		if @server.options.type is 3

				# This proccess will become event driven (so after all compiling is done) instead of a time delay
				setTimeout(=>
					@server.ready = true
					@browserify()	if @server.options.type is 1 or @server.options.type is 3
					@forever()		if @server.options.type is 1 or @server.options.type is 2
				,250)

		# Watch for the Browserify task
		if @server.options.type is 1
			chokidar
				.watch @browserifyRebuild, ignored: [ /[\/\\]\./, "#{@browserifyRebuild}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
				.on 'add', (filePath)		=> @browserify()
				.on 'change', (filePath)	=> @browserify()
				.on 'unlink', (filePath)	=> @browserify()

		# Watch for the Forever task
		if @server.options.type is 1 or @server.options.type is 2
			chokidar
				.watch @foreverRestart , ignored: /[\/\\]\./
				.on 'change', (filePath)	=> @forever()
				.on 'unlink', (filePath)	=> @forever()


	watcher2: ->

		# Watch for the Browserify task
		if @server.options.type is 3
			chokidar
				.watch @browserifyServer, ignored: [ /[\/\\]\./, "#{@browserifyServer}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
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

		console.log 'Remove file', filePath


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