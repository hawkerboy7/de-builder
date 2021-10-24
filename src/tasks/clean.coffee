# NPM
fs  = require "fs-extra"
log = require "de-logger"



class Clean

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "builder:start", @start


	start: =>

		# Remove build folder
		fs.remove @server.folders.build.index, =>

			# Create build folder
			fs.mkdirp(@server.folders.build.index).then =>

				log.info "LDE - Clean", @server.symbols.finished

				# Notify application
				@server.vent.emit "clean:done"



module.exports = Clean
