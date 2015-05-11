(function() {
  var Explaination, Project, Validate, fs, log, mkdirp;

  fs = require('fs');

  log = require('de-logger');

  mkdirp = require('mkdirp');

  Validate = require('./validate');

  Explaination = require('./explaination');


  /* TO DO: Add the possibility to build the de-base project! */

  Project = (function() {
    var folderError;

    function Project(options) {
      this.options = options;
      if (!Validate(this.options)) {
        return;
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
      mkdirp(this.srcServer, function(err) {
        if (err) {
          return folderError(err);
        }
      });
      mkdirp(this.srcClient, function(err) {
        if (err) {
          return folderError(err);
        }
      });
      mkdirp(this.buildServer, function(err) {
        if (err) {
          return folderError(err);
        }
      });
      return mkdirp(this.buildClient, function(err) {
        if (err) {
          return folderError(err);
        }
      });
    };

    Project.prototype.typeTwo = function() {
      mkdirp(this.src, function(err) {
        if (err) {
          return folderError(err);
        }
      });
      return mkdirp(this.build, function(err) {
        if (err) {
          return folderError(err);
        }
      });
    };

    folderError = function(err) {
      return log.error('LDE - Project', 'Unable to create folder', err);
    };

    return Project;

  })();

  module.exports = Project;

}).call(this);
