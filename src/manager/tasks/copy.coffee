# --------------------------------------------------
#	Copy ~ Copy all file that don't need to compile
# --------------------------------------------------
class Copy

	constructor: (@server) ->

	_compile: ({file}, next) -> next null, file

	compile: (filePath) ->

		# Parts [path to file, compile function, task name, src and target extentions
		parts = [
			filePath,
			@_compile,
			'Copy'
		]

		@server.fileSystem.compile parts



module.exports = Copy