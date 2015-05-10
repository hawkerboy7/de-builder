# --------------------------------------------------
#	Validate ~ Validates the provided options
# --------------------------------------------------
log = require 'de-logger'

# My Modules
merge = require '../../helper/merge'


Validate = (config, options) ->

	# Return default config if no options are provided
	unless options

		# Notify
		log.debug 'LDE - Validate', 'No options provided'

		# Use default
		return config

	# An object should be provided
	if typeof options isnt 'object' or Object.prototype.toString.call(options) isnt '[object Object]'

		# Notify
		log.warn 'LDE - Validate', 'The provided options should be in an object'

		# Use default
		return config

	# Merge options on to config
	merge config, options

	config



module.exports = Validate