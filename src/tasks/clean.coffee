# Node
fs = require "fs"

# NPM
log    = require "de-logger"
rmdir  = require "rmdir"
mkdirp = require "mkdirp"



class Clean

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "builder:start", @start


	start: =>

		# Remove build folder
		rmdir @server.folders.build.index, =>

			# Create build folder
			mkdirp @server.folders.build.index, =>

				log.info "LDE - Clean", @server.symbols.finished

				# Notify application
				@server.vent.emit "clean:done"



module.exports = Clean
