# Node
path = require "path"

# NPM
fs       = require "fs-extra"
log      = require "de-logger"
coffee   = require "coffeescript"
notifier = require "node-notifier"



class Coffee

	constructor: (@server) ->

		@listeners()


	listeners: ->

		@server.vent.on "coffee:file", @coffee


	coffee: (file, init) =>

		# Create destination path for compiled file
		build = @server.toBuild(file).replace ".coffee", ".js"

		# Read coffee file
		fs.readFile @server.root+path.sep+file, encoding: "utf-8" , (err, data) =>

			if err

				@notify err.message

				return log.error err


			# Make sure path to destination exists
			fs.mkdirp(path.dirname(build)).then =>

				try
					coffeeScript = coffee.compile(data, bare: true)
				catch e
					coffeeScript = ""

					@notify msg = "#{file}\nLine: #{e.location.first_line}\n#{e.message}"

					log.error "#{@server.config.title} - Coffee", "\n#{msg}","\n",e.code

				# Write compiled coffee file to its destination
				fs.writeFile name = @server.root+path.sep+build, coffeeScript , (err) =>

					if err

						@notify err.message

						return log.error err

					@server.vent.emit "compiled:file",
						file    : name
						title   : "#{@server.config.title} - Coffee"
						message : "#{build}"

					# Notify the watch in case the init has not been triggered
					@server.vent.emit "watch:increase" if not init


	notify: (message) ->

		notifier.notify
			title   : "#{@server.config.title} - Coffee"
			message : message



module.exports = Coffee
