# Node
fs   = require 'fs'
path = require 'path'

# NPM
log      = require 'de-logger'
chokidar = require 'chokidar'



class Watch

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on 'project:done', @watchSrc
		@server.vent.on 'watch:increase', @increase
		@server.vent.on 'watch:initialized', @watchBuild


	watchSrc: =>

		# Count the files being added before the ready trigger
		@init  = false
		@count =
			first  : 0
			second : 0

		# Start watch
		log.info "#{@server.config.title} - Watch", '~ Night gathers, and now my watch begins ~'

		# Start the watcher chokidar
		chokidar
			.watch @server.config.src, ignored: /[\/\\]\./
			.on 'add', @add
			.on 'change', @change
			.on 'unlink', @unlink
			.on 'ready', @ready


	add: (file) =>

		# Increase counter if not initialized
		@count.first++ if not @init

		# Add handler
		@addChange 'Add', file


	change: (file) =>

		# Change handler
		@addChange 'Change', file


	addChange: (type, file) ->

		# Notify
		log.debug "#{@server.config.title} - Watch", "#{type}: #{file}"

		# Get extention
		extention = path.extname file

		# Compile specific extentions
		return @server.vent.emit 'less:file', file, @init if extention is '.less'
		return @server.vent.emit 'coffee:file', file, @init if extention is '.coffee'

		# Copy file in case extention isn't supported
		@server.vent.emit 'copy:file', file, @init


	unlink: (file) =>

		# Seperate path
		seperated = file.split path.sep

		# Remove first entry (src folder)
		seperated.shift()

		# File to remove in the build folder
		remove = @server.config.build+path.sep+seperated.join path.sep

		# Notify
		log.info "#{@server.config.title} - Watch", "Unlink: #{remove}"

		# Try to remove the file in the build folder
		fs.unlink @server.root+path.sep+remove, (e) =>

			# Catch error but don't do anything with it in case the file isn't there for some reason


	ready: =>

		@init = true

		# Notify
		log.debug "#{@server.config.title} - Watch", "Ready: #{@count.first} files initially added"

		# Watch has found all files
		@server.vent.emit 'watch:init'


	increase: (count) =>

		# Count init file builds (due to less it also accepts multiple counts)
		if count
			@count.second += count
		else
			@count.second++

		# Guard: Don't do anything until ready trigger is fired and counts are the same
		return if not (@init and @count.second is @count.first)

		# Watch has fully been initialized
		@initialized = true

		# Notify
		log.debug "#{@server.config.title} - Watch", "Ready: #{@count.second} files have initially been created"

		# Notify the initial addition of files trough watch has been finished
		@server.vent.emit 'watch:initialized'


	watchBuild: =>

		@browserify()
		@application()


	application: ->

		# console.log "start watching for the application"

		# # Set application entry folder path
		# application = @server.folders.build.index
		# application = @server.folders.build.build if @server.config.type is 2

		# console.log 'application', application

		# chokidar
		# 	.watch application, ignored: /[\/\\]\./
		# 	# .on 'add', @appAdd
		# 	.on 'change', @appChange
		# 	.on 'ready', @appReady


	# appAdd: (file) => console.log "appAdd", file
	appChange: => console.log "appChange"
	appReady: => console.log "appReady"


	browserify: ->

		console.log "start watching for browserify"



module.exports = Watch


###
# --------------------------------------------------
#   Watch ~ Watches all relevant LDE files
# --------------------------------------------------


class Watch

	constructor: (@server) ->


	start: ->

		sub = ""

		sub = "/#{@server.options.server}" if @server.options.type isnt 2

		# Source file to watch
		@src               = "#{@server.options.root}/#{@server.options.src}"

		@foreverRestart    = "#{@server.options.root}/#{@server.options.build}#{sub}"
		@browserifyServer  = "#{@server.options.root}/#{@server.options.build}/#{@server.options.browserify.folder}"
		@browserifyRebuild = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.browserify.folder}"

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
				@watcher2()     if @server.options.type is 3

				# This proccess will become event driven (so after all compiling is done) instead of a time delay
				setTimeout(=>
					@server.ready = true
					@browserify()   if @server.options.type is 1 or @server.options.type is 3
					@forever()      if @server.options.type is 1 or @server.options.type is 2
				,250)

		# Watch for the Browserify task
		if @server.options.type is 1
			chokidar
				.watch @browserifyRebuild, ignored: [ /[\/\\]\./, "#{@browserifyRebuild}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
				.on 'add',    => @browserify()
				.on 'change', => @browserify()
				.on 'unlink', => @browserify()

		# Watch for the Forever task
		if @server.options.type is 1 or @server.options.type is 2
			chokidar
				.watch @foreverRestart , ignored: /[\/\\]\./
				.on 'change', => @forever()
				.on 'unlink', => @forever()


	watcher2: ->

		# Watch for the Browserify task
		if @server.options.type is 3
			chokidar
				.watch @browserifyServer, ignored: [ /[\/\\]\./, "#{@browserifyServer}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
				.on 'add',    => @browserify()
				.on 'change', => @browserify()
				.on 'unlink', => @browserify()


	check: (filePath) ->

		# Get extention
		extention = path.extname filePath

		# Notify
		log.debug 'LDE - Watch', "Add/Change: " + filePath.replace "#{@server.options.root}/", ''

		# Compile specific extentions
		return @server.less.compile filePath   if extention is '.less'
		return @server.coffee.compile filePath if extention is '.coffee'

		# Copy files in case no extention is recognized
		@server.copy.compile filePath


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


###