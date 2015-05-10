var Manager;

Manager = require('./manager');

process.title = "de-builder a Live Development Environment";

module.exports = function(options) {
  return new Manager(options, process.argv[2] === '--start');
};
