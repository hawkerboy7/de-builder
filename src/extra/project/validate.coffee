# --------------------------------------------------
#	Validate ~ Checks if provided options are valid / allowed
# --------------------------------------------------
Validate = (options) ->

	valid = true

	# Should be an allowed folder/path string
	# options.src
	# options.build

	# Setup should contain
	# options.type
	# options.client	# Only if type is 2
	# options.server

	return options if valid



module.exports = Validate