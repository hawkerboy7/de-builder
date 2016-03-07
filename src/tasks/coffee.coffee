# Node
fs   = require 'fs'
path = require 'path'

# NPM
log    = require 'de-logger'
mkdirp = require 'mkdirp'
coffee = require 'coffee-script'



class Coffee

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on 'coffee:file', @coffee


	coffee: (file, init) =>

		# Create destination path for compiled file
		build = @server.toBuild(file).replace '.coffee', '.js'

		# Read coffee file
		fs.readFile @server.root+path.sep+file, encoding: 'utf-8' , (err, data) =>

			return log.error err if err

			# Make sure path to destination exists
			mkdirp path.dirname(build), =>

				# Write compiled coffee file to its destination
				fs.writeFile @server.root+path.sep+build, coffee.compile(data, bare: true), (err) =>

					return log.error err if err

					log.info "#{@server.config.title} - Coffee", "#{build}"

					# Notify the watch in case the init hassn't been triggered
					@server.vent.emit 'watch:increase' if not init



module.exports = Coffee