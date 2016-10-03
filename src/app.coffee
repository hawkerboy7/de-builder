# --------------------------------------------------
# Allow for options to be send along with initialization
# --------------------------------------------------

# Modules
Manager = require './manager'

# Exports a function that provides options for the manager
module.exports = (config) -> new Manager config
