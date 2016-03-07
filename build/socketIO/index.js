(function() {
  var Handler, SocketIO, io, log, path;

  path = require('path');

  io = require('socket.io');

  log = require('de-logger');

  Handler = require('./handler');

  SocketIO = (function() {
    function SocketIO(server) {
      this.server = server;
      this.load();
    }

    SocketIO.prototype.load = function() {
      this.server.io = io().listen(this.server.config.io.port, this.server.config.io.host);
      log.info('LDE - Socket.io', this.server.config.title + " events at " + this.server.config.io.host + ":" + this.server.config.io.port);
      return this.listeners();
    };

    SocketIO.prototype.listeners = function() {
      this.server.io.on('connection', (function(_this) {
        return function(socket) {
          return new Handler({
            socket: socket,
            server: _this.server
          });
        };
      })(this));
      return this.server.vent.on('project:done', (function(_this) {
        return function() {
          return _this.server.io.emit('project:done');
        };
      })(this));
    };

    return SocketIO;

  })();

  module.exports = SocketIO;

}).call(this);
