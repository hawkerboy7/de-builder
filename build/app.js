// --------------------------------------------------
// Allow for options to be send along with initialization
// --------------------------------------------------

// Modules
var Manager;

Manager = require("./manager");

// Exports a function that provides options for the manager
module.exports = function(config) {
  return new Manager(config);
};
