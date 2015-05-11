(function() {
  var Explaination;

  Explaination = function(type) {
    var message;
    message = 'Project type "';
    if (type === 1) {
      message += 'Server-Client';
    }
    if (type === 2) {
      message += 'Server';
    }
    if (type === 3) {
      message += 'Client (NodeWebkit)';
    }
    return message += '" has been set-up!';
  };

  module.exports = Explaination;

}).call(this);
