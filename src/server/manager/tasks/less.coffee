# --------------------------------------------------
#	Less ~ Turn .less into .css
# --------------------------------------------------
fs		= require 'fs'
less	= require 'less'

# Define global
Server = null



class Less

	constructor: (@server) ->

		Server = @server


	_compile: ({file, filePath}, next) ->

		# Path to less files
		path = "#{Server.options.root}/#{Server.options.src}/#{Server.options.client}/#{Server.options.less.folder}"

		# Less entry file
		entry = "#{path}/#{Server.options.less.file}"

		# If entry file is is found store it
		if filePath is entry

			# Store entry file
			Server.files.less = file
		else
			# If initial scan isn't complete
			return unless Server.ready

		# Only continue if entry less file is found
		return unless Server.files.less

		# Render less file path to include files has been added
		less.render Server.files.less, { paths: [path], filename: "#{Server.options.less.file}", compress: true }, (e, output) ->

			# Continue file system
			next e, output?.css, true


	compile: (filePath) ->

		# Parts [path to file, compile function, task name, src and target extentions
		parts = [
			filePath
			@_compile
			'Less'
			{ src: '.less', target: '.css' }
		]

		@server.fileSystem.compile parts



module.exports = Less