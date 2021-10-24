// Node
var BrowserSync, browserSync, fs, http, log, path, version;

http = require("http");

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

browserSync = require("browser-sync");

({version} = require("browser-sync/package.json"));

BrowserSync = class BrowserSync {
  constructor(server) {
    this.initialized = this.initialized.bind(this);
    this.reload = this.reload.bind(this);
    this.bundle = this.bundle.bind(this);
    this.server = server;
    if (false || !this.server.config.browserSync.enabled || this.server.config.type === 2 || this.server.env === "production") {
      return;
    }
    this.load();
    this.listeners();
  }

  load() {
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
    // Initialize server
    return this.bs.init(config, (err) => {
      if (err) {
        // Notify error
        return log.error(`${this.server.config.title} - Browser-sync`, "Could not start \n\n", err);
      }
      // Retreive browserify code
      return this.code();
    });
  }

  listeners() {
    this.server.vent.on("browserify:initialized", this.initialized);
    this.server.vent.on("browserify:bundle", this.bundle);
    return this.server.vent.on("compiled:file", this.reload);
  }

  initialized(w) {
    var added, bundle, folder, i, len, ref;
    this.init = true;
    // Check if multi or single
    if (w._browserSyncIndicator) {
      added = false;
      ref = this.config.multi;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (!(bundle = w[folder])) {
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
      w.require("socket.io-client", {
        expose: "socket.io-client"
      });
      // Add socket.io-client trough a file
      w.add(path.resolve(__dirname, "../socketIO/socket.io-client"));
      // Add Browser-sync to the bundle
      return w.add(this.filePath);
    }
  }

  code() {
    // Notify start
    log.info(`${this.server.config.title} - Browser-sync`, "Browser-sync server started");
    // Download file
    return this.download(`http://localhost:${this.config.server}/browser-sync/browser-sync-client.js?v=${version}`, (err) => {
      if (err) {
        // Notify start
        return log.error(`${this.server.config.title} - Browser-sync`, "Unable to get browser-sync .js file", err);
      }
      // Notify ready
      return log.info(`${this.server.config.title} - Browser-sync`, `UI ready at localhost:${this.config.ui}`);
    });
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

  reload({file}) {
    if (!this.init) {
      return;
    }
    if (".css" === path.extname(file)) {
      return this._reload(file);
    }
  }

  bundle(file) {
    return this._reload(file);
  }

  _reload(file) {
    // Notify start
    log.info(`${this.server.config.title} - Browser-sync`, "Reload", file.replace(`${this.server.root}/`, ""));
    // Reload based on file path
    return this.bs.reload(file);
  }

};

module.exports = BrowserSync;
