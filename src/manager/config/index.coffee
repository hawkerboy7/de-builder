# --------------------------------------------------
#	Config ~ Default configuration
# --------------------------------------------------
config =

	# Source and build directory
	src:	'src'
	build:	'build'

	# Client and server directory
	client:	'client'
	server:	'server'

	# Less directory and entry file
	less:
		file:	'app.less'
		folder:	'styles'

	# Browserify directory and entry file
	browserify:
		file:	'app.js'
		folder:	'js'

	# Server path/file to be started by forever
	forever:
		enabled: true
		file: 'app.js'

	# Start browser-sync and add's it to the browserify bundle
	browserSync:
		enabled: true

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client (Node Webkit)
	# 4 Client (Cordova)
	type:	1

	# Show de-builder events
	debug: false



module.exports = config