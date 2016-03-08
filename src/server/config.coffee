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
		file    : 'app.js'
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

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type: 1

	# Show de-builder events
	debug: false
	# debug: true

	# next: multi bundles on client side, browserify, browserSync, forever


	# Start browser-sync and add's it to the browserify bundle
	browserSync:
		enabled: true



module.exports = config