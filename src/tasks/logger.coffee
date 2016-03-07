# NPM
log    = require 'de-logger'



class Logger

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on 'compiled:file', @log


	log: ({title, message, file}) =>

		log.info title, message




module.exports = Logger