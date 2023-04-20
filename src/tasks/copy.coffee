# Node
path = require "path"

# NPM
fs  = require "fs-extra"
log = require "de-logger"



class Copy

	constructor: (@server) ->

		@server.copy = process: @process


	process: (file) =>

		new Promise (resolve) =>

			# Create path to destination
			destination = @server.toDestination file

			# Create a read stream
			read = fs.createReadStream @server.root + path.sep + file

			try
				await fs.mkdirp path.dirname destination

				write = fs.createWriteStream name = @server.root + path.sep + destination

				write.on "finish", =>

					log.info "#{@server.config.title} - Copy", "#{destination}"

					resolve()

				# Read file and write to destination
				read.pipe write

			catch e

				log.error "#{@server.config.title} - Copy", e.stack



module.exports = Copy
