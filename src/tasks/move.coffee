# Node
path = require "path"

# NPM
fs  = require "fs-extra"
log = require "de-logger"



class Move

	constructor: (@server) ->

		@server.move = process: @process


	process: =>

		new Promise (resolve) =>

			return resolve true if @server.initialized

			try
				await fs.move @server.folders.temp.index, @server.folders.build.index, overwrite: true
			catch e
				log.error "#{@server.config.title} - Move", e.stack
				log.error "Rebuild the project since to build folder is present right now"
				return resolve()

			resolve true



module.exports = Move
