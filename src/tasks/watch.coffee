# Node
fs   = require "fs-extra"
path = require "path"

# NPM
log      = require "de-logger"
chokidar = require "chokidar"



class Watch

	constructor: (@server) ->

		@server.watch = close : @close

		@timeouts = {}


	init: ->

		new Promise (resolve) =>

			files = await @gather()

			await @handle files

			resolve()


	gather: ->

		new Promise (resolve) =>

			log.info "#{@server.config.title} - Watch", "~ Night gathers, and now my watch begins ~"

			files = {}

			@watcher = chokidar.watch @server.config.src, ignored: /[\/\\]\./
			@watcher
				.on "add", (file) => files[file] = true
				.on "change", @change
				.on "ready", =>
					log.info "#{@server.config.title} - Watch", "Found #{Object.keys(files).length} initial files"
					resolve files


	handle: (files) ->

		new Promise (resolve) =>
			list = {}
			list[file] = @process file for file of files
			await promise for name, promise of list
			resolve()


	process: (file, extention) ->

		new Promise (resolve) =>

			log.debug "#{@server.config.title} - Process", file

			extention or= path.extname file

			return resolve await @server.coffee.process file if extention is ".coffee"
			return resolve() if extention is ".less"

			await @server.copy.process file

			resolve()


	close: =>

		@watcher.close()


	change: (file) =>

		return if not @server.phaseOneDone

		# To allow most of the changes in case of a branch switch to run first
		setTimeout(=>
			@nextTick file
		, 10)


	nextTick: (file) ->

		extention = path.extname file

		await @process file, extention

		return if not (extention is ".coffee" or extention is ".pug" or extention is ".less")

		# Determine if the file is located in the client-side code or server-side
		serverFolder = file.split("/")[1]

		server = @server.config.type is 2 or serverFolder is @server.config.server

		# Prevents multiple change triggers (when switching branches for example) from creating bundles
		clearTimeout @timeouts[server+extention]

		@timeouts[server+extention] = setTimeout(=>
			if server
				@server.forever.run() if extention is ".coffee"
			else
				if extention is ".coffee" or extention is ".pug"
					await @server.browserify.process file
					@server.browserSync.process file
				else if extention is ".less"
					dFiles = await @server.less.process file
					@server.browserSync.process dFile for dFile in dFiles
		, 250)


	# unlink: (file) =>

	# 	console.log "check this: unlink", file

	# 	# # Seperate path
	# 	# seperated = file.split path.sep

	# 	# # Remove first entry (src folder)
	# 	# seperated.shift()

	# 	# # File to remove in the build folder
	# 	# remove = @server.config.temp+path.sep+seperated.join path.sep

	# 	# # Notify
	# 	# log.info "#{@server.config.title} - Watch", "Unlink: #{remove}"

	# 	# # Try to remove the file in the build folder
	# 	# fs.unlink @server.root+path.sep+remove, (e) ->

	# 	# 	# Catch error but do not do anything with it in case the file is not there for some reason



module.exports = Watch
