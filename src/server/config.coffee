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

	# Show de-builder events
	debug: false
	# debug: true

	# next: multi bundles on client side, browserify, browserSync, forever






	# Browserify directory and entry file
	browserify:
		file   : 'app.js'
		debug  : true
		folder : 'js'

	# Server path/file to be started by forever
	forever:
		file    : 'app.js'
		enabled : true

	# Start browser-sync and add's it to the browserify bundle
	browserSync:
		enabled: true

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type: 1



module.exports = config