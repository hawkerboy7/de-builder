config =

	# Project
	title     : 'LDE'
	fullTitle : 'Live Development Environment'

	# Socket.io server for listening to de-builder events
	io:
		port : 8009
		host : 'localhost'

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

	# Server path/file to be started by forever
	forever:
		entry   : 'app.js'
		enabled : true

	# Browserify directory and entry file
	browserify:

		# Used for single build
		single:
			entry  : 'app.coffee'
			bundle : 'app.bundle.js'

		# Used for multi build
		multi : 'bundle.js'

		# Used in both cases
		debug  : true
		folder : 'js'

	# Use browser-sync options
	browserSync:

		# Use it, or not
		enabled: true

		# Provide names of the multi bundle(s) that should contain the browser-sync code
		multi: ['vendor']

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type: 1

	# Show de-builder events
	debug: false
	# debug: true

	# next: browserSync, forever



module.exports = config