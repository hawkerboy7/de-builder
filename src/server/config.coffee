config =

	# Socket.io server for listening to de-builder events
	io : 8009

	# Source and build directory
	src   : 'src'
	build : 'build'

	# Client and server directory
	client: 'client'
	server: 'server'

	# Less directory and entry file
	less:
		file   : 'app.css'
		entry  : 'app.less'
		folder : 'styles'

	# Browserify directory and entry file
	browserify:

		# Used for single build
		single:
			entry  : 'app.coffee'
			bundle : 'app.bundle.js'

		# Used for multi build
		multi : 'bundle.js'

		# Used in both cases
		# Show or hide source maps that allow you to debug your files separately.
		debug  : true

		# Folder to js files
		folder : 'js'

	# Server path/file to be started by forever
	forever:
		entry   : 'app.js'
		enabled : true

	# Use browser-sync options
	browserSync:

		# Use it, or not
		enabled : true

		# user interface port
		ui      : 9000

		# server port
		server  : 9001

		# Provide names of the multi bundle(s) that should contain the browser-sync code
		multi   : ['vendor']

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client
	type: 1

	# Show de-builder debug events
	debug: false



module.exports = config