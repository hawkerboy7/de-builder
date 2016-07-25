var Manager;

Manager = require('./manager');

module.exports = function(config) {
  return new Manager(config);
};
