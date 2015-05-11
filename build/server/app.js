var Manager;

Manager = require('./manager');

process.title = "de-builder";

module.exports = function(options) {
  return new Manager(options, process.argv[2] === '--start');
};
