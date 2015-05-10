var Explaination;

Explaination = function(type) {
  var message;
  message = 'Setting up new "';
  if (type === 1) {
    message += 'Server-Client';
  }
  if (type === 2) {
    message += 'Server';
  }
  if (type === 3) {
    message += 'NodeWebkit';
  }
  return message += '" project';
};

module.exports = Explaination;
