(function() {
  var Explaination, Project, Validate, log, mkdirp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require('de-logger');

  mkdirp = require('mkdirp');

  Validate = require('./validate');

  Explaination = require('./explaination');

  Project = (function() {
    function Project(options, cb) {
      this.options = options;
      this.cb = cb;
      this.handle = bind(this.handle, this);
      if (!Validate(this.options)) {
        return this.cb('provided options where not valid');
      }
      this.folders();
      log.info('LDE - Project', Explaination(this.options.type));
    }

    Project.prototype.folders = function() {
      this.src = this.options.root + "/" + this.options.src;
      this.build = this.options.root + "/" + this.options.build;
      this.srcServer = this.src + "/" + this.options.server;
      this.srcClient = this.src + "/" + this.options.client;
      this.buildServer = this.build + "/" + this.options.server;
      this.buildClient = this.build + "/" + this.options.client;
      this.i = 0;
      if (this.options.type === 1) {
        this.typeOne();
      }
      if (this.options.type === 2) {
        this.typeTwo();
      }
      if (this.options.type === 3) {
        return this.typeTwo();
      }
    };

    Project.prototype.typeOne = function() {
      mkdirp(this.srcServer, this.handle);
      mkdirp(this.srcClient, this.handle);
      mkdirp(this.buildServer, this.handle);
      return mkdirp(this.buildClient, this.handle);
    };

    Project.prototype.typeTwo = function() {
      mkdirp(this.src, this.handle);
      return mkdirp(this.build, this.handle);
    };

    Project.prototype.handle = function(e) {
      this.i++;
      if (e) {
        return log.debug('LDE - Project', 'Unable to create folder', e);
      }
      if ((this.options.type === 1 && this.i === 4) || (this.options.type === 2 && this.i === 2)) {
        return this.cb();
      }
    };

    return Project;

  })();

  module.exports = Project;

}).call(this);
