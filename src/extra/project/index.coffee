# --------------------------------------------------
#	Project ~ Build a new default project structure based on provided options
# --------------------------------------------------
log    = require 'de-logger'
mkdirp = require 'mkdirp'

# My Modules
Validate     = require './validate'
Explaination = require './explaination'



class Project

	constructor: (@options, @cb) ->

		# Check if provided options are valid / allowed
		return @cb 'provided options where not valid' unless Validate @options

		# Build folders
		@folders()

		# Notify project type
		log.info 'LDE - Project', Explaination @options.type


	folders: ->

		@src         = "#{@options.root}/#{@options.src}"
		@build       = "#{@options.root}/#{@options.build}"

		@srcServer   = "#{@src}/#{@options.server}"
		@srcClient   = "#{@src}/#{@options.client}"

		@buildServer = "#{@build}/#{@options.server}"
		@buildClient = "#{@build}/#{@options.client}"

		@i = 0
		@typeOne() if @options.type is 1
		@typeTwo() if @options.type is 2
		@typeTwo() if @options.type is 3


	typeOne: ->
		mkdirp @srcServer,   @handle
		mkdirp @srcClient,   @handle
		mkdirp @buildServer, @handle
		mkdirp @buildClient, @handle


	typeTwo: ->
		mkdirp @src,   @handle
		mkdirp @build, @handle


	handle: (e) =>

		@i++

		return log.debug 'LDE - Project', 'Unable to create folder', e if e

		@cb() if (@options.type is 1 and @i is 4) or (@options.type is 2 and @i is 2)



module.exports = Project