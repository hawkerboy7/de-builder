# Node
fs   = require 'fs'
path = require 'path'

# NPM
log    = require 'de-logger'
mkdirp = require 'mkdirp'

less   = require 'less'



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

			log.info "#{@server.config.title} - Less", "Using type: #{@type}"


	determin: ->

		@folders = []

		# Read all files in entry folder
		fs.readdir @folder, (e, files) =>

			return log.error "#{@server.config.title} - Less", e if e

			# Loop over all results
			for file in files

				# Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
				continue if not fs.statSync(folder = @folder+path.sep+file).isDirectory()

				# Add less bundle folders
				@folders.push folder

				log.error "#{@server.config.title} - Less", "No folders are found for a multi setup" if @folders.length is 0


	less: (file, init) =>

		# Guard: don't build .css if the watch issn't ready
		return if file and not init

		log.debug "#{@server.config.title} - Less", "Change: #{file}" if file

		# Comple a single bundle if multiple bundles are not required
		@single @entry, @folder, @destination, @map if @type is 'single'


	multi: (file) ->

		console.log '', file




	single: (sFile, sFolder, dFile, dFolder, type) ->

		fs.readFile sFile, 'utf8', (e, res) =>

			if e
				log.error "#{@server.config.title} - Less", "#{e}"
				return

			# Create folder structure for the .css file
			mkdirp dFolder, =>

				# Create less file
				less.render res, {paths: [sFolder], filename: @config.file, compress: true}, (e, output) =>

					# In case of an error in the .less file
					return log.error "#{@server.config.title} - Less", e if e

					return log.error "#{@server.config.title} - Less", "No css output: #{output}" if not (css = output?.css) and (css isnt "")

					# Write css file to destination
					fs.writeFile dFile, css, (e) =>

						# In case of an error in the .less file
						return log.error "#{@server.config.title} - Less", e if e

						message = ""
						message = "Multi: " if type

						log.info "#{@server.config.title} - Less", message+@destination.replace @server.root+path.sep, ''



module.exports = Less