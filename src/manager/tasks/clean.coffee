# --------------------------------------------------
#	Clean ~ Clean the build directory
# --------------------------------------------------
fs	= require 'fs'
log	= require 'de-logger'



class Clean

	constructor: (@server) ->

	start: (next) ->

		@buildFolder = "#{@server.options.root}/#{@server.options.build}/"
		@serverFolder = "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}"
		@clientFolder = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}"

		if @server.options.type is 1

			@remove @serverFolder
			@remove @clientFolder

			log.info 'LDE - Clean', @server.symbols.finished


		if @server.options.type is 2 or @server.options.type is 3

			@remove @buildFolder

			log.info 'LDE - Clean', @server.symbols.finished

		# Done
		next()


	remove: (dirPath) ->

		try
			files = fs.readdirSync dirPath
		catch e
			return

		if files.length > 0
			for i of files
				filePath = dirPath + '/' + files[i]

				if fs.statSync(filePath).isFile()
					fs.unlinkSync filePath
				else
					@remove filePath

		# Don't remove the server and client folders
		fs.rmdirSync dirPath unless dirPath is @serverFolder or dirPath is @clientFolder



module.exports = Clean