# Node
path = require "path"

# NPM
fs       = require "fs-extra"
log      = require "de-logger"
less     = require "less"
notifier = require "node-notifier"



class Less

	constructor: (@server) ->

		return if @server.config.type is 2

		@setup()
		@listeners()


	listeners: ->

		@server.vent.on "less:file", @less
		@server.vent.on "watch:init", @less


	setup: ->

		@done = false
		@count = 0

		# Short refrence to less config
		@config = @server.config.less

		# Create path to less entry file and folder
		@folder = @server.folders.src.client+path.sep+@config.folder
		@folder = @server.folders.src.index+path.sep+@config.folder if @server.config.type is 3
		@entry  = @folder+path.sep+@config.entry

		# Create path to destination file and folder
		@map         = @server.folders.temp.client+path.sep+@config.folder
		@map         = @server.folders.temp.index+path.sep+@config.folder if @server.config.type is 3
		@destination = @map+path.sep+@config.file

		# Check if entry file exists
		fs.stat @entry, (e) =>

			if not e
				@type = "single"
			else
				@type = "multi"
				@determin()

			log.info "#{@server.config.title} - Less", "Type: #{@type}"


	determin: ->

		log.debug "#{@server.config.title} - Less", "Entry file not found: #{@entry}"

		# Store multi setup folders
		@folders = []

		# Read all files in entry folder
		fs.readdir @folder, (e, files) =>

			return log.error "#{@server.config.title} - Less", e if e

			# Loop over all results
			for file in files

				# Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
				continue if not fs.statSync(folder = @folder+path.sep+file).isDirectory()

				# Add less bundle folders
				@folders.push
					src   : folder
					bare  : folder.replace @server.root+path.sep, ""
					name  : file

			if @folders.length is 0

				@notify msg = "No folders are found for a multi setup"

				log.error "#{@server.config.title} - Less", msg


	less: (file, init) =>

		# Guard: don"t build .css if the watch is not ready
		return @count++ if file and not init

		log.debug "#{@server.config.title} - Less", "Change: #{file}" if file

		# Comple a single bundle if multiple bundles are not required
		if @type is "single"

			@single
				sFile   : @entry
				sFolder : @folder
				dFile   : @destination

		# Compile one (or all) of the multiple bundles
		if @type is "multi"

			@multi file


	multi: (file) ->

		return @increase() if @folders.length is 0

		for folder in @folders

			if file
				continue if -1 is file.indexOf folder.bare

			@single
				sFile   : folder.src+path.sep+"index.less"
				sFolder : folder.src
				dFile   : @map+path.sep+folder.name+".css"
				name    : folder.name


	single: ({sFile, sFolder, dFile, name}) ->

		fs.readFile sFile, "utf8", (e, res) =>

			if e
				@notify e.message

				log.error "#{@server.config.title} - Less", "#{e}"
				return @increase()

			# Create folder structure for the .css file
			fs.mkdirp(@map).then =>

				# Create less file
				less.render res, {paths: [sFolder], compress: @server.env is "production"}, (e, output) =>

					# In case of an error in the .less file
					if e
						@notify "#{e.filename}\nLine: #{e.line}\n#{e.type} error - #{e.message}"

						log.error "#{@server.config.title} - Less", "\n", "#{e.filename}\nLine: #{e.line}\nColumn: #{e.column}\n#{e.type} error\n#{e.message}\nExtract:", e.extract

						return @increase()

					if not (css = output?.css) and (css isnt "")

						@notify "No css output, check terminal"

						log.error "#{@server.config.title} - Less", "No css output: #{output}"
						return @increase()

					# Write css file to destination
					fs.writeFile dFile, css, (e) =>

						# In case of an error in the .less file
						if e
							log.error "#{@server.config.title} - Less", e
							return @increase()

						# Define prefix
						if name then prefix = "#{name}: " else prefix = ""

						@server.vent.emit "compiled:file",
							file    : dFile
							title   : "#{@server.config.title} - Less"
							message : prefix+dFile.replace @server.root+path.sep, ""

						@increase()


	increase: ->

		return if @done

		# Set bool
		@done = true

		# Notify watcher for the initialized trigger
		@server.vent.emit "watch:increase", @count


	notify: (message, name) ->

		notifier.notify
			title   : "#{@server.config.title} - Less - #{name}"
			message : message



module.exports = Less
