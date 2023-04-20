// Node
var BrowserSync, browserSync, fs, http, log, path, version;

http = require("http");

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

({version} = require("browser-sync/package.json"));

browserSync = require("browser-sync");

BrowserSync = class BrowserSync {
  constructor(server) {
    this.add = this.add.bind(this);
    this.process = this.process.bind(this);
    this.server = server;
    this.server.browserSync = {
      process: this.process
    };
  }

  init() {
    return new Promise(async(resolve) => {
      if ((!this.server.config.browserSync.enabled) || this.server.config.type === 2 || this.server.env === "production") {
        return resolve();
      }
      await this.load();
      await this.code();
      await this.add();
      return resolve();
    });
  }

  load() {
    return new Promise((resolve) => {
      var config;
      this.config = this.server.config.browserSync;
      // Create path to gf browser-sync file
      this.filePath = this.server.myRoot + path.sep + "build" + path.sep + "browser-sync.js";
      // Create browsersync server
      this.bs = browserSync.create();
      // Set browsersync config
      config = {
        ui: {
          port: this.config.ui
        },
        port: this.config.server,
        logLevel: "silent",
        ghostMode: false,
        logFileChanges: false
      };
      return this.bs.init(config, (err) => {
        if (err) {
          log.error(`${this.server.config.title} - Browser-sync`, "Could not start \n\n", err);
        }
        return resolve();
      });
    });
  }

  code() {
    return new Promise((resolve) => {
      log.info(`${this.server.config.title} - Browser-sync`, "Browser-sync server started");
      return this.download(`http://localhost:${this.config.server}/browser-sync/browser-sync-client.js?v=${version}`, (err) => {
        if (err) {
          log.error(`${this.server.config.title} - Browser-sync`, "Unable to get browser-sync .js file", err);
        } else {
          log.info(`${this.server.config.title} - Browser-sync`, `UI ready at localhost:${this.config.ui}`);
        }
        return resolve();
      });
    });
  }

  add() {
    var added, bundle, folder, i, len, ref;
    // Check if multi or single
    if (this.server.browserify.w._browserSyncIndicator) {
      added = false;
      ref = this.config.multi;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (!(bundle = this.server.browserify.w[folder])) {
          continue;
        }
        added = true;
        // Make socket.io-client require'able
        bundle.require("socket.io-client", {
          expose: "socket.io-client"
        });
        // Add socket.io-client trough a file
        bundle.add(path.resolve(__dirname, "../socketIO/socket.io-client"));
        // Add Browser-sync to the bundle
        bundle.add(this.filePath);
      }
      if (!added) {
        return log.warn(`${this.server.config.title} - Browser-sync`, "browser-sync was not added");
      }
    } else {
      // Make socket.io-client require"able
      this.server.browserify.w.require("socket.io-client", {
        expose: "socket.io-client"
      });
      // Add socket.io-client trough a file
      this.server.browserify.w.add(path.resolve(__dirname, "../socketIO/socket.io-client"));
      // Add Browser-sync to the bundle
      return this.server.browserify.w.add(this.filePath);
    }
  }

  download(url, cb) {
    return fs.mkdirp(path.dirname(this.filePath)).then(() => {
      // Store in a file
      this.file = fs.createWriteStream(this.filePath);
      // Download file with http
      return http.get(url, (response) => {
        return response.pipe(this.file).on("error", (err) => {
          fs.unlink(this.file);
          return cb(err);
        }).on("finish", () => {
          return this.file.close(cb);
        });
      });
    });
  }

  process(file) {
    // Notify start
    log.info(`${this.server.config.title} - Browser-sync`, "Reload", file);
    // Reload based on file path
    return this.bs.reload(file);
  }

};

module.exports = BrowserSync;
