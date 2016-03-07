# Node
fs   = require 'fs'
path = require 'path'

# NPM
log    = require 'de-logger'
mkdirp = require 'mkdirp'

less   = require 'less'



class Less

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on 'less:file', @less
		@server.vent.on 'watch:init', @less


	less: (file, init) =>

		# Guard: don't build .css if the watch issn't ready
		return if file and not init

		# Declare what happens the initial build
		if file
			log.debug "#{@server.config.title} - Less", "Start #{file}"
		else
			log.info "#{@server.config.title} - Less", "Start initial build"

		# Create path to less entry file and folder
		folder = @server.folders.src.client+path.sep+@server.config.less.folder
		entry  = folder+path.sep+@server.config.less.entry

		# Create path to destination file and folder
		map         = @server.folders.build.client+path.sep+@server.config.less.folder
		destination = map+path.sep+@server.config.less.file

		fs.readFile entry, 'utf8', (e, res) =>

			if e
				log.warn "#{@server.config.title} - Less", "Unable to read entry file: #{entry}"
				log.error "#{@server.config.title} - Less", "#{e}"
				return

			# Create folder structure for the .css file
			mkdirp map, =>

				# Create less file
				less.render res, {paths: [folder], filename: @server.config.less.file, compress: true}, (e, output) =>

					# In case of an error in the .less file
					return log.error "#{@server.config.title} - Less", e if e

					return log.error "#{@server.config.title} - Less", "No css output: #{output}" if not (css = output?.css) and (css isnt "")

					# Write css file to destination
					fs.writeFile destination, css, (e) =>

						# In case of an error in the .less file
						return log.error "#{@server.config.title} - Less", e if e

						log.info "#{@server.config.title} - Less", destination.replace @server.root+path.sep, ''



module.exports = Less