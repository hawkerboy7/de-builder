(function() {
  var Manager;

  Manager = require('./manager');

  process.title = "de-builder";

  module.exports = function(options) {
    return new Manager(options);
  };

}).call(this);
