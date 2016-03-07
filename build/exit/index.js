(function() {
  var Exit, log,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require('de-logger');

  Exit = (function() {
    function Exit(server) {
      this.server = server;
      this.command = bind(this.command, this);
      this.sigterm = bind(this.sigterm, this);
      this.sigint = bind(this.sigint, this);
      this.uncaughtException = bind(this.uncaughtException, this);
      this.exit = bind(this.exit, this);
      this.listeners();
    }

    Exit.prototype.listeners = function() {
      this.readInput();
      process.on('exit', this.exit);
      process.on('SIGINT', this.sigint);
      process.on('SIGTERM', this.sigterm);
      process.on('command', this.command);
      return process.on('uncaughtException', this.uncaughtException);
    };

    Exit.prototype.readInput = function() {
      process.stdin.setEncoding('utf8');
      return process.stdin.on('data', (function(_this) {
        return function(command) {
          return process.emit('command', command.slice(0, -1));
        };
      })(this));
    };

    Exit.prototype.exit = function(code) {
      return log.info(this.server.config.title, 'Exit:', code);
    };

    Exit.prototype.uncaughtException = function(e) {
      console.log('');
      return log.warn(this.server.config.title, 'Uncaught Exception Found\n\n', e.stack);
    };

    Exit.prototype.sigint = function() {
      console.log('');
      log.info(this.server.config.title, 'Application Interrupted');
      return process.exit(130);
    };

    Exit.prototype.sigterm = function() {
      console.log('');
      log.info(this.server.config.title, 'Application Terminated');
      return process.exit(143);
    };

    Exit.prototype.command = function(command) {
      if (command === 'exit') {
        return process.exit();
      }
    };

    return Exit;

  })();

  module.exports = Exit;

}).call(this);
