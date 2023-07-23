// Node
var Watch, chokidar, fs, log, path;

fs = require("fs-extra");

path = require("path");

// NPM
log = require("de-logger");

chokidar = require("chokidar");

Watch = class Watch {
  constructor(server1) {
    this.close = this.close.bind(this);
    this.change = this.change.bind(this);
    this.server = server1;
    this.server.watch = {
      close: this.close
    };
    this.timeouts = {};
  }

  init() {
    return new Promise(async(resolve) => {
      var files;
      files = (await this.gather());
      await this.handle(files);
      return resolve();
    });
  }

  gather() {
    return new Promise((resolve) => {
      var files;
      log.info(`${this.server.config.title} - Watch`, "~ Night gathers, and now my watch begins ~");
      files = {};
      this.watcher = chokidar.watch(this.server.config.src, {
        ignored: /[\/\\]\./
      });
      return this.watcher.on("add", (file) => {
        return files[file] = true;
      }).on("change", this.change).on("ready", () => {
        log.info(`${this.server.config.title} - Watch`, `Found ${Object.keys(files).length} initial files`);
        return resolve(files);
      });
    });
  }

  handle(files) {
    return new Promise(async(resolve) => {
      var file, list, name, promise;
      list = {};
      for (file in files) {
        list[file] = this.process(file);
      }
      for (name in list) {
        promise = list[name];
        await promise;
      }
      return resolve();
    });
  }

  process(file, extention) {
    return new Promise(async(resolve) => {
      log.debug(`${this.server.config.title} - Process`, file);
      extention || (extention = path.extname(file));
      if (extention === ".coffee") {
        return resolve((await this.server.coffee.process(file)));
      }
      if (extention === ".less") {
        return resolve();
      }
      await this.server.copy.process(file);
      return resolve();
    });
  }

  close() {
    return this.watcher.close();
  }

  change(file) {
    if (!this.server.phaseOneDone) {
      return;
    }
    // To allow most of the changes in case of a branch switch to run first
    return setTimeout(() => {
      return this.nextTick(file);
    }, 50);
  }

  async nextTick(file) {
    var error, extention, server, serverFolder;
    extention = path.extname(file);
    // When an error happens on processing we do not run the process so the error remains in the terminal
    if (error = (await this.process(file, extention))) {
      return;
    }
    if (!(extention === ".coffee" || extention === ".pug" || extention === ".less")) {
      return;
    }
    // Determine if the file is located in the client-side code or server-side
    serverFolder = file.split("/")[1];
    server = this.server.config.type === 2 || serverFolder === this.server.config.server;
    // Prevents multiple change triggers (when switching branches for example) from creating bundles
    clearTimeout(this.timeouts[server + extention]);
    return this.timeouts[server + extention] = setTimeout(async() => {
      var dFile, dFiles, i, len, results;
      if (server) {
        if (extention === ".coffee") {
          return this.server.forever.run();
        }
      } else {
        if (extention === ".coffee" || extention === ".pug") {
          await this.server.browserify.process(file);
          return this.server.browserSync.process(file);
        } else if (extention === ".less") {
          dFiles = (await this.server.less.process(file));
          results = [];
          for (i = 0, len = dFiles.length; i < len; i++) {
            dFile = dFiles[i];
            results.push(this.server.browserSync.process(dFile));
          }
          return results;
        }
      }
    }, 250);
  }

};

// unlink: (file) =>

// 	console.log "check this: unlink", file

// 	# # Seperate path
// 	# seperated = file.split path.sep

// 	# # Remove first entry (src folder)
// 	# seperated.shift()

// 	# # File to remove in the build folder
// 	# remove = @server.config.temp+path.sep+seperated.join path.sep

// 	# # Notify
// 	# log.info "#{@server.config.title} - Watch", "Unlink: #{remove}"

// 	# # Try to remove the file in the build folder
// 	# fs.unlink @server.root+path.sep+remove, (e) ->

// 	# 	# Catch error but do not do anything with it in case the file is not there for some reason
module.exports = Watch;
