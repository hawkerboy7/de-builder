# Node
fs   = require 'fs'
path = require 'path'

# NPM
log    = require 'de-logger'
less   = require 'less'
mkdirp = require 'mkdirp'



class Less

	constructor: (@server) ->

		return if @server.config.type is 2

		@setup()
		@listeners()


	listeners: ->

		@server.vent.on 'less:file', @less
		@server.vent.on 'watch:init', @less


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
		@map         = @server.folders.build.client+path.sep+@config.folder
		@map         = @server.folders.build.index+path.sep+@config.folder if @server.config.type is 3
		@destination = @map+path.sep+@config.file

		# Check if entry file exists
		fs.stat @entry, (e) =>

			if not e
				@type = 'single'
			else
				@type = 'multi'
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
					bare  : folder.replace @server.root+path.sep, ''
					name  : file

			log.error "#{@server.config.title} - Less", "No folders are found for a multi setup" if @folders.length is 0


	less: (file, init) =>

		# Guard: don't build .css if the watch issn't ready
		return @count++ if file and not init

		log.debug "#{@server.config.title} - Less", "Change: #{file}" if file

		# Comple a single bundle if multiple bundles are not required
		if @type is 'single'

			@single
				sFile   : @entry
				sFolder : @folder
				dFile   : @destination

		# Compile one (or all) of the multiple bundles
		if @type is 'multi'

			@multi file


	multi: (file) ->

		return @notify() if @folders.length is 0

		for folder in @folders

			(continue if -1 is file.indexOf folder.bare) if file

			@single
				sFile   : folder.src+path.sep+'index.less'
				sFolder : folder.src
				dFile   : @map+path.sep+folder.name+'.css'
				name    : folder.name


	single: ({sFile, sFolder, dFile, name}) ->

		fs.readFile sFile, 'utf8', (e, res) =>

			if e
				log.error "#{@server.config.title} - Less", "#{e}"
				return @notify()

			# Create folder structure for the .css file
			mkdirp @map, =>

				# Create less file
				less.render res, {paths: [sFolder], compress: true}, (e, output) =>

					# In case of an error in the .less file
					if e
						log.error "#{@server.config.title} - Less", e.message
						return @notify()

					if not (css = output?.css) and (css isnt "")
						log.error "#{@server.config.title} - Less", "No css output: #{output}"
						return @notify()

					# Write css file to destination
					fs.writeFile dFile, css, (e) =>

						# In case of an error in the .less file
						if e
							log.error "#{@server.config.title} - Less", e
							return @notify()

						# Define prefix
						if name then prefix = "#{name}: " else prefix = ""

						@server.vent.emit 'compiled:file',
							file    : dFile
							title   : "#{@server.config.title} - Less"
							message : prefix+dFile.replace @server.root+path.sep, ''

						@notify()


	notify: ->

		return if @done

		# Set bool
		@done = true

		# Notify watcher for the initialized trigger
		@server.vent.emit 'watch:increase', @count



module.exports = Less