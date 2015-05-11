var BrowserSync, Browserify, Clean, Coffee, Copy, EventEmitter, FileSystem, Forever, Less, Tasks, Watch;

EventEmitter = require('events').EventEmitter;

Copy = require('./copy');

Less = require('./less');

Clean = require('./clean');

Watch = require('./watch');

Coffee = require('./coffee');

Forever = require('./forever');

Browserify = require('./browserify');

FileSystem = require('./fileSystem');

BrowserSync = require('./browserSync');

Tasks = (function() {
  function Tasks(options) {
    this.options = options;
    this.load();
  }

  Tasks.prototype.load = function() {
    this.server = {
      ready: null,
      files: {},
      events: new EventEmitter,
      symbols: {
        start: '•',
        finished: '✔'
      },
      options: this.options
    };
    this.server.copy = new Copy(this.server);
    this.server.clean = new Clean(this.server);
    this.server.watch = new Watch(this.server);
    this.server.coffee = new Coffee(this.server);
    this.server.forever = new Forever(this.server);
    this.server.fileSystem = new FileSystem(this.server);
    if (this.server.options.type !== 2) {
      this.server.less = new Less(this.server);
      this.server.browserify = new Browserify(this.server);
      this.server.browserSync = new BrowserSync(this.server);
    }
    return this.server.clean.start((function(_this) {
      return function() {
        return _this.server.watch.start();
      };
    })(this));
  };

  return Tasks;

})();

module.exports = Tasks;
