# NPM
fs  = require "fs-extra"
log = require "de-logger"



class Clean

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "builder:start", @start


	start: =>

		# Remove temp folder
		fs.remove @server.folders.temp.index, =>

			# Create temp folder
			fs.mkdirp(@server.folders.temp.index).then =>

				log.info "LDE - Clean", @server.symbols.finished

				# Notify application
				@server.vent.emit "clean:done"



module.exports = Clean
