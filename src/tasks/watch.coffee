# Node
fs   = require "fs"
path = require "path"

# NPM
log      = require "de-logger"
chokidar = require "chokidar"



class Watch

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "project:done", @watchSrc
		@server.vent.on "watch:increase", @increase


	watchSrc: =>

		# Count the files being added before the ready trigger
		@init  = false
		@count =
			first  : 0
			second : 0

		# Start watch
		log.info "#{@server.config.title} - Watch", "~ Night gathers, and now my watch begins ~"

		# Start the chokidar the file wachter
		@watcher = chokidar.watch @server.config.src, ignored: /[\/\\]\./

		@watcher
			.on "add", @add
			.on "change", @change
			.on "unlink", @unlink
			.on "ready", @ready


	add: (file) =>

		# Increase counter if not initialized
		@count.first++ if not @init

		# Add handler
		@addChange "Add", file


	change: (file) =>

		# Change handler
		@addChange "Change", file


	addChange: (type, file) ->

		# Notify
		log.debug "#{@server.config.title} - Watch", "#{type}: #{file}"

		# Get extention
		extention = path.extname file

		# Compile specific extentions
		return @server.vent.emit "less:file", file, @init if extention is ".less"
		return @server.vent.emit "coffee:file", file, @init if extention is ".coffee"

		# Copy file in case extention is not supported
		@server.vent.emit "copy:file", file, @init


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
		fs.unlink @server.root+path.sep+remove, (e) ->

			# Catch error but do not do anything with it in case the file is not there for some reason


	ready: =>

		@init = true

		# Notify
		log.info "#{@server.config.title} - Watch", "Ready: #{@count.first} files initially added"

		# Watch has found all files
		@server.vent.emit "watch:init"

		# When NOT running do no conitnue watching for file changes either
		return if @server.run

		# Close all file watching
		await @watcher.close()

		# Notify
		log.info "#{@server.config.title} - Watch", "And Now My Watch Is Ended"


	increase: (count) =>

		# Count init file builds (due to less it also accepts multiple counts)
		if count
			@count.second += count
		else
			@count.second++

		# Guard: Do not do anything until ready trigger is fired and counts are the same
		return if not (@init and @count.second is @count.first)

		# Watch has fully been initialized
		@initialized = true

		# Notify
		log.debug "#{@server.config.title} - Watch", "Ready: #{@count.second} files have initially been created"

		# Notify the initial addition of files trough watch has been finished
		@server.vent.emit "watch:initialized"



module.exports = Watch
