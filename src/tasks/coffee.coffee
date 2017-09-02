# Node
fs   = require "fs"
path = require "path"

# NPM
log    = require "de-logger"
mkdirp = require "mkdirp"
coffee = require "coffee-script"



class Coffee

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "coffee:file", @coffee


	coffee: (file, init) =>

		# Create destination path for compiled file
		build = @server.toBuild(file).replace ".coffee", ".js"

		# Read coffee file
		fs.readFile @server.root+path.sep+file, encoding: "utf-8" , (err, data) =>

			return log.error err if err

			# Make sure path to destination exists
			mkdirp path.dirname(build), =>

				try
					coffeeScript = coffee.compile(data, bare: true)
				catch e
					coffeeScript = ""
					log.error "#{@server.config.title} - Coffee", file, e.message, e.location

				# Write compiled coffee file to its destination
				fs.writeFile name = @server.root+path.sep+build, coffeeScript , (err) =>

					return log.error err if err

					@server.vent.emit "compiled:file",
						file    : name
						title   : "#{@server.config.title} - Coffee"
						message : "#{build}"

					# Notify the watch in case the init has not been triggered
					@server.vent.emit "watch:increase" if not init



module.exports = Coffee
