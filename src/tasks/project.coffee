# Node
path = require "path"

# NPM
fs  = require "fs-extra"
log = require "de-logger"



class Project

	constructor: (@server) ->


	init: ->

		log.info "#{@server.config.title} - Project", "Setup project folders"

		new Promise (resolve) =>

			@folders()

			await @clean()

			await @type()

			resolve()


	folders: ->

		@server.folders =
			src:
				index: src = "#{@server.root}#{path.sep}#{@server.config.src}"
				server: "#{src}#{path.sep}#{@server.config.server}"
				client: "#{src}#{path.sep}#{@server.config.client}"
			temp:
				index: temp = "#{@server.root}#{path.sep}#{@server.config.temp}"
				server: "#{temp}#{path.sep}#{@server.config.server}"
				client: "#{temp}#{path.sep}#{@server.config.client}"
			build:
				index: build = "#{@server.root}#{path.sep}#{@server.config.build}"
				server: "#{build}#{path.sep}#{@server.config.server}"
				client: "#{build}#{path.sep}#{@server.config.client}"


	clean: =>

		new Promise (resolve) =>
			try
				if @server.initialized
					await fs.remove @server.folders.build.index
					await fs.mkdirp @server.folders.build.index
					log.info "#{@server.config.title} - Clean build", @server.symbols.finished
				else
					await fs.remove @server.folders.temp.index
					await fs.mkdirp @server.folders.temp.index
					log.info "#{@server.config.title} - Clean temp", @server.symbols.finished
				resolve()
			catch e
				log.error "#{@server.config.title} - Clean - Error", e.stack


	type: =>

		new Promise (resolve) =>

			if @server.config.type is 1
				await fs.mkdirp @server.folders.src.client
				await fs.mkdirp @server.folders.src.server
				if not @server.initialized
					await fs.mkdirp @server.folders.temp.client
					await fs.mkdirp @server.folders.temp.server
			else
				await fs.mkdirp @server.folders.src.index
				if not @server.initialized
					await fs.mkdirp @server.folders.temp.index

			# Notify project type
			log.info "LDE - Project", @explaination()

			resolve()


	explaination: ->

		type = @server.config.type

		message = "Project type \""
		message += "Server-Client" if type is 1
		message += "Server"        if type is 2
		message += "Client"        if type is 3
		message += "\" is used"



module.exports = Project
