# Node
fs   = require 'fs'
path = require 'path'

# NPM
log    = require 'de-logger'
less   = require 'less'
mkdirp = require 'mkdirp'




class Less

	constructor: (@server) ->

		@setup()
		@listeners()


	listeners: ->

		@server.vent.on 'less:file', @less
		@server.vent.on 'watch:init', @less


	setup: ->

		# Short refrence to less config
		@config = @server.config.less

		# Create path to less entry file and folder
		@folder = @server.folders.src.client+path.sep+@config.folder
		@entry  = @folder+path.sep+@config.entry

		# Create path to destination file and folder
		@map         = @server.folders.build.client+path.sep+@config.folder
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
		return if file and not init

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
				return

			# Create folder structure for the .css file
			mkdirp @map, =>

				# Create less file
				less.render res, {paths: [sFolder], compress: true}, (e, output) =>

					# In case of an error in the .less file
					return log.error "#{@server.config.title} - Less", e if e

					return log.error "#{@server.config.title} - Less", "No css output: #{output}" if not (css = output?.css) and (css isnt "")

					# Write css file to destination
					fs.writeFile dFile, css, (e) =>

						# In case of an error in the .less file
						return log.error "#{@server.config.title} - Less", e if e

						# Define prefix
						if name then prefix = "#{name}: " else prefix = ""

						log.info "#{@server.config.title} - Less", prefix+dFile.replace @server.root+path.sep, ''



module.exports = Less