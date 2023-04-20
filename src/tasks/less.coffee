# Node
path = require "path"

# NPM
fs       = require "fs-extra"
log      = require "de-logger"
less     = require "less"
notifier = require "node-notifier"



class Less

	constructor: (@server) ->

		@server.less = process: @process

		@setup()


	setup: ->

		# Short refrence to less config
		@config = @server.config.less

		# Create path to less entry file and folder
		if @server.config.type is 3
			@folder = @server.folders.src.index
		else
			@folder = @server.folders.src.client

		@folder += path.sep + @config.folder
		@folder = @folder.replace @server.root + path.sep, ""

		@entry = @folder + path.sep + @config.entry

		# Create path to destination file and folder
		if @server.config.type is 3
			@map = @server.folders.temp.index
		else
			@map = @server.folders.temp.client

		@map += path.sep + @config.folder
		@map = @map.replace @server.root + path.sep, ""
		@destination = @map + path.sep + @config.file

		try
			stats = fs.statSync @entry
		catch e

		if e
			@type = "multi"
			@determin()
		else
			@type = "single"

		log.info "#{@server.config.title} - Less", "Type: #{@type}"


	determin: ->

		log.debug "#{@server.config.title} - Less", "Entry file not found: #{@entry}"

		# Store multi setup folders
		@folders = []

		# Read all files in entry folder
		fs.readdir @server.root + path.sep + @folder, (e, files) =>

			return log.error "#{@server.config.title} - Less", e if e

			# Loop over all results
			for file in files

				# Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
				continue if not fs.statSync(@server.root + path.sep + (folder = @folder + path.sep + file)).isDirectory()

				# Add less bundle folders
				@folders.push
					path : folder
					name : file

			if @folders.length is 0
				log.error "#{@server.config.title} - Less", "No folders are found for a multi setup"


	process: (file) =>

		new Promise (resolve) =>

			return resolve() if @server.config.type is 2

			log.info "#{@server.config.title} - Less", "Init" if file

			if @type is "multi"
				dFiles = await @multi file
			else if @type is "single"
				dFile = await @single
					sFile   : @entry
					sFolder : @folder
					dFile   : @destination
				dFiles = [dFile]

			resolve dFiles


	multi: (file) ->

		new Promise (resolve) =>

			return resolve() if @folders.length is 0

			list = {}

			for folder in @folders

				continue if file and -1 is file.indexOf folder.path

				list[sFile = folder.path + path.sep + "index.less"] = @single
					sFile   : sFile
					sFolder : folder.path
					dFile   : @map + path.sep + folder.name + ".css"
					dFolder : folder.name

			dFiles = []
			dFiles.push await promise for key, promise of list

			resolve dFiles


	single: ({sFile, sFolder, dFile, dFolder}) ->

		dFile = @server.toDestination dFile
		map = @server.toDestination @map

		new Promise (resolve) =>

			try
				res = await fs.readFile @server.root + path.sep + sFile, "utf8"
			catch e
				log.error "#{@server.config.title} - Less", e.stack
				return resolve()

			try
				await fs.mkdirp @server.root + path.sep + map
			catch e
				log.error "#{@server.config.title} - Less", e.stack
				return resolve()

			less.render res, {paths: [@server.root + path.sep + sFolder], compress: @server.env is "production"}, (e, output) =>

				if e
					log.error "#{@server.config.title} - Less", "\n", "#{e.filename}\nLine: #{e.line}\nColumn: #{e.column}\n#{e.type} error\n#{e.message}\nExtract:", e.extract
					return resolve()

				if not (css = output?.css) and (css isnt "")
					log.error "#{@server.config.title} - Less", "No css output: #{output}"
					return resolve()

				try
					await fs.writeFile @server.root + path.sep + dFile, css
				catch e
					log.error "#{@server.config.title} - Less", e.stack
					return resolve()

				prefix = if dFolder then "#{dFolder}: " else ""

				log.info "#{@server.config.title} - Less", prefix + dFile

				resolve dFile



module.exports = Less
