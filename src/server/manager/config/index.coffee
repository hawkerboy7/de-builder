# --------------------------------------------------
#	Config ~ Provides default configuration
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
	app: 'app.js'

	# LDE environments
	# 1 Server+Client
	# 2 Server
	# 3 Client (Node Webkit)
	type:	1



module.exports = config