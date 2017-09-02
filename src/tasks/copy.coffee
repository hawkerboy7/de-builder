# Node
fs   = require "fs"
path = require "path"

# NPM
log    = require "de-logger"
mkdirp = require "mkdirp"



class Copy

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "copy:file", @copy


	copy: (file, init) =>

		# Create path to destination
		build = @server.toBuild file

		# Create a read stream
		read = fs.createReadStream @server.root+path.sep+file

		# Ensure destination folders exist
		mkdirp path.dirname(build), =>

			# Create write stream
			write = fs.createWriteStream name = @server.root+path.sep+build

			write.on "finish", =>

				@server.vent.emit "compiled:file",
					file    : name
					title   : "#{@server.config.title} - Copy"
					message : "#{build}"

				# Notify the watch in case the init has not been triggered
				@server.vent.emit "watch:increase" if not init

			# Read file and write to destination
			read.pipe write



module.exports = Copy
