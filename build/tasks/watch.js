(function() {
  var Watch, chokidar, fs, log, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  chokidar = require('chokidar');

  Watch = (function() {
    function Watch(server) {
      this.server = server;
      this.increase = bind(this.increase, this);
      this.ready = bind(this.ready, this);
      this.unlink = bind(this.unlink, this);
      this.change = bind(this.change, this);
      this.add = bind(this.add, this);
      this.watchSrc = bind(this.watchSrc, this);
      this.listeners();
    }

    Watch.prototype.listeners = function() {
      this.server.vent.on('project:done', this.watchSrc);
      return this.server.vent.on('watch:increase', this.increase);
    };

    Watch.prototype.watchSrc = function() {
      this.init = false;
      this.count = {
        first: 0,
        second: 0
      };
      log.info(this.server.config.title + " - Watch", '~ Night gathers, and now my watch begins ~');
      return chokidar.watch(this.server.config.src, {
        ignored: /[\/\\]\./
      }).on('add', this.add).on('change', this.change).on('unlink', this.unlink).on('ready', this.ready);
    };

    Watch.prototype.add = function(file) {
      if (!this.init) {
        this.count.first++;
      }
      return this.addChange('Add', file);
    };

    Watch.prototype.change = function(file) {
      return this.addChange('Change', file);
    };

    Watch.prototype.addChange = function(type, file) {
      var extention;
      if (this.init) {
        log.info(this.server.config.title + " - Watch", type + ": " + file);
      } else {
        log.debug(this.server.config.title + " - Watch", type + ": " + file);
      }
      extention = path.extname(file);
      if (extention === '.less') {
        return this.server.vent.emit('less:file', file, this.init);
      }
      if (extention === '.coffee') {
        return this.server.vent.emit('coffee:file', file, this.init);
      }
      return this.server.vent.emit('copy:file', file, this.init);
    };

    Watch.prototype.unlink = function(file) {
      var remove, seperated;
      seperated = file.split(path.sep);
      seperated.shift();
      remove = this.server.config.build + path.sep + seperated.join(path.sep);
      log.info(this.server.config.title + " - Watch", "Unlink: " + remove);
      return fs.unlink(this.server.root + path.sep + remove, (function(_this) {
        return function(e) {};
      })(this));
    };

    Watch.prototype.ready = function() {
      this.init = true;
      log.debug(this.server.config.title + " - Watch", "Ready: " + this.count.first + " files initially added");
      return this.server.vent.emit('watch:init');
    };

    Watch.prototype.increase = function() {
      this.count.second++;
      if (!(this.init && this.count.second === this.count.first)) {
        return;
      }
      this.initialized = true;
      log.debug(this.server.config.title + " - Watch", "Ready: " + this.count.second + " files have initially been created");
      return this.server.vent.emit('watch:initialized');
    };

    return Watch;

  })();

  module.exports = Watch;


  /*
   * --------------------------------------------------
   *   Watch ~ Watches all relevant LDE files
   * --------------------------------------------------
  log      = require 'de-logger'
  path     = require 'path'
  chokidar = require 'chokidar'
  
  
  
  class Watch
  
  	constructor: (@server) ->
  
  
  	start: ->
  
  		sub = ""
  
  		sub = "/#{@server.options.server}" if @server.options.type isnt 2
  
  		 * Source file to watch
  		@src               = "#{@server.options.root}/#{@server.options.src}"
  
  		@foreverRestart    = "#{@server.options.root}/#{@server.options.build}#{sub}"
  		@browserifyServer  = "#{@server.options.root}/#{@server.options.build}/#{@server.options.browserify.folder}"
  		@browserifyRebuild = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.browserify.folder}"
  
  		 * Start wachter
  		@watcher()
  
  
  	watcher: ->
  
  		 * Watch source
  		chokidar
  			.watch @src, ignored: /[\/\\]\./
  			.on 'add', (filePath) => @check filePath
  			.on 'change', (filePath) => @check filePath
  			.on 'unlink', (filePath) => @remove filePath
  			.on 'ready', =>
  
  				 * Start watching the build after CLEAN is finished
  				@watcher2()     if @server.options.type is 3
  
  				 * This proccess will become event driven (so after all compiling is done) instead of a time delay
  				setTimeout(=>
  					@server.ready = true
  					@browserify()   if @server.options.type is 1 or @server.options.type is 3
  					@forever()      if @server.options.type is 1 or @server.options.type is 2
  				,250)
  
  		 * Watch for the Browserify task
  		if @server.options.type is 1
  			chokidar
  				.watch @browserifyRebuild, ignored: [ /[\/\\]\./, "#{@browserifyRebuild}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
  				.on 'add',    => @browserify()
  				.on 'change', => @browserify()
  				.on 'unlink', => @browserify()
  
  		 * Watch for the Forever task
  		if @server.options.type is 1 or @server.options.type is 2
  			chokidar
  				.watch @foreverRestart , ignored: /[\/\\]\./
  				.on 'change', => @forever()
  				.on 'unlink', => @forever()
  
  
  	watcher2: ->
  
  		 * Watch for the Browserify task
  		if @server.options.type is 3
  			chokidar
  				.watch @browserifyServer, ignored: [ /[\/\\]\./, "#{@browserifyServer}/#{@server.options.browserify.file}".replace '.js', '.bundle.js' ]
  				.on 'add',    => @browserify()
  				.on 'change', => @browserify()
  				.on 'unlink', => @browserify()
  
  
  	check: (filePath) ->
  
  		 * Get extention
  		extention = path.extname filePath
  
  		 * Notify
  		log.debug 'LDE - Watch', "Add/Change: " + filePath.replace "#{@server.options.root}/", ''
  
  		 * Compile specific extentions
  		return @server.less.compile filePath   if extention is '.less'
  		return @server.coffee.compile filePath if extention is '.coffee'
  
  		 * Copy files in case no extention is recognized
  		@server.copy.compile filePath
  
  
  	remove: (filePath) ->
  
  		log.debug 'LDE - Watch', 'File in build should be removed: ', filePath
  
  
  	browserify: ->
  
  		 * Don't start unless src watch is ready (and also 'probably' fully compiled)
  		return unless @server.ready
  
  		return unless @server.browserSync.ready
  
  		 * Notify
  		log.debug 'LDE - Watch', "Browserify triggered"
  
  		 * Compile browserify
  		@server.browserify.compile()
  
  
  	forever: ->
  
  		 * Don't start unless src watch is ready (and also 'probably' fully compiled)
  		return unless @server.ready
  
  		 * Notify
  		log.debug 'LDE - Watch', "Forever triggered"
  
  		 * Start server with forever
  		@server.forever.start()
  
  
  
  module.exports = Watch
   */

}).call(this);
