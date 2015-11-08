# --------------------------------------------------
#	App ~ Sets title, clears console and starts the Manager
# --------------------------------------------------
Manager	= require './manager'

# Provide a name for the process
process.title = "de-builder"

# Export a function containing the Manager to allow external options and arguments
module.exports = (options) ->

	# Start the Manager with options and process argument
	new Manager options