# --------------------------------------------------
#	Coffee ~ Compiles all .coffee files
# --------------------------------------------------
coffee = require 'coffee-script'



class Coffee

	constructor: (@server) ->

	_compile: ({file, server}, next) ->

		# Compile js file from coffee
		# - If file is a "server" file a bare compile is made
		next null, coffee.compile file, bare: server


	compile: (filePath) ->

		# Parts [path to file, compile function, task name, src and target extentions
		parts = [
			filePath,
			@_compile,
			'Coffee',
			{ src: '.coffee', target: '.js' }
		]

		@server.fileSystem.compile parts



module.exports = Coffee