# Node
path = require "path"

# NPM
fs     = require "fs-extra"
log    = require "de-logger"
coffee = require "coffeescript"



class Coffee

	constructor: (@server) ->

		@server.coffee = process: @process


	process: (file) =>

		new Promise (resolve) =>

			destination = @server.toDestination(file).replace ".coffee", ".js"

			try
				data = await fs.readFile @server.root + path.sep + file, encoding: "utf-8"
				await fs.mkdirp path.dirname destination
			catch e
				log.error "#{@server.config.title} - Coffee", "read+mkdirp", e.stack
				return resolve()

			try
				coffeeScript = coffee.compile data, bare: true
			catch e
				coffeeScript = ""
				log.error "#{@server.config.title} - Coffee", file, "Line: #{e.location.first_line}", e.message, e.code
				return resolve()

			try
				await fs.writeFile name = @server.root + path.sep + destination, coffeeScript
			catch e
				log.error "#{@server.config.title} - Coffee", "write", e.stack
				return resolve()

			log.info "#{@server.config.title} - Coffee", destination

			resolve()



module.exports = Coffee
