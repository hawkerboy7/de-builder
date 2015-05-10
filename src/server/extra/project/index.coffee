# --------------------------------------------------
#	Project ~ Build a new default project from
#				scratch based on provided options
# --------------------------------------------------
fs		= require 'fs'
log		= require 'de-logger'
mkdirp	= require 'mkdirp'

# My Modules
Validate		= require './validate'
Explaination	= require './explaination'


### TO DO: Add the possibility to build the de-base project! ###
class Project

	constructor: (@options) ->

		# Check if provided options are valid / allowed
		return unless Validate @options

		# Notify project type
		log.info 'LDE - Project', Explaination @options.type

		# Build folders
		@folders()


	folders: ->

		@src			= "#{@options.root}/#{@options.src}"
		@build			= "#{@options.root}/#{@options.build}"

		@srcServer		= "#{@src}/#{@options.server}"
		@srcClient		= "#{@src}/#{@options.client}"

		@buildServer	= "#{@build}/#{@options.server}"
		@buildClient	= "#{@build}/#{@options.client}"

		@typeOne()	if @options.type is 1
		@typeTwo()	if @options.type is 2
		@typeTwo()	if @options.type is 3


	typeOne: ->
		mkdirp @srcServer,		(err) -> folderError err if err
		mkdirp @srcClient,		(err) -> folderError err if err
		mkdirp @buildServer,	(err) -> folderError err if err
		mkdirp @buildClient,	(err) -> folderError err if err


	typeTwo: ->
		mkdirp @src,	(err) -> folderError err if err
		mkdirp @build,	(err) -> folderError err if err


	folderError = (err) ->
		log.error 'LDE - Project', 'Unable to create folder', err



module.exports = Project