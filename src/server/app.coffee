# --------------------------------------------------
#	App ~ Sets title, clears console and starts Manager
# --------------------------------------------------
Manager	= require './manager'

# Provide a name for the process
process.title = "de-builder a Live Development Environment"

# Export a function containing the Manager to allow external options and arguments
module.exports = (options) ->

	# Start the Manager with options and process argument
	new Manager options, process.argv[2] is '--start'