// Node
var Less, fs, less, log, notifier, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

less = require("less");

notifier = require("node-notifier");

Less = class Less {
  constructor(server) {
    this.less = this.less.bind(this);
    this.server = server;
    if (this.server.config.type === 2) {
      return;
    }
    this.setup();
    this.listeners();
  }

  listeners() {
    this.server.vent.on("less:file", this.less);
    return this.server.vent.on("watch:init", this.less);
  }

  setup() {
    this.done = false;
    this.count = 0;
    // Short refrence to less config
    this.config = this.server.config.less;
    // Create path to less entry file and folder
    this.folder = this.server.folders.src.client + path.sep + this.config.folder;
    if (this.server.config.type === 3) {
      this.folder = this.server.folders.src.index + path.sep + this.config.folder;
    }
    this.entry = this.folder + path.sep + this.config.entry;
    // Create path to destination file and folder
    this.map = this.server.folders.temp.client + path.sep + this.config.folder;
    if (this.server.config.type === 3) {
      this.map = this.server.folders.temp.index + path.sep + this.config.folder;
    }
    this.destination = this.map + path.sep + this.config.file;
    // Check if entry file exists
    return fs.stat(this.entry, (e) => {
      if (!e) {
        this.type = "single";
      } else {
        this.type = "multi";
        this.determin();
      }
      return log.info(`${this.server.config.title} - Less`, `Type: ${this.type}`);
    });
  }

  determin() {
    log.debug(`${this.server.config.title} - Less`, `Entry file not found: ${this.entry}`);
    // Store multi setup folders
    this.folders = [];
    // Read all files in entry folder
    return fs.readdir(this.folder, (e, files) => {
      var file, folder, i, len, msg;
      if (e) {
        return log.error(`${this.server.config.title} - Less`, e);
      }
// Loop over all results
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (!fs.statSync(folder = this.folder + path.sep + file).isDirectory()) {
          // Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
          continue;
        }
        // Add less bundle folders
        this.folders.push({
          src: folder,
          bare: folder.replace(this.server.root + path.sep, ""),
          name: file
        });
      }
      if (this.folders.length === 0) {
        this.notify(msg = "No folders are found for a multi setup");
        return log.error(`${this.server.config.title} - Less`, msg);
      }
    });
  }

  less(file, init) {
    if (file && !init) {
      // Guard: don"t build .css if the watch is not ready
      return this.count++;
    }
    if (file) {
      log.debug(`${this.server.config.title} - Less`, `Change: ${file}`);
    }
    // Comple a single bundle if multiple bundles are not required
    if (this.type === "single") {
      this.single({
        sFile: this.entry,
        sFolder: this.folder,
        dFile: this.destination
      });
    }
    // Compile one (or all) of the multiple bundles
    if (this.type === "multi") {
      return this.multi(file);
    }
  }

  multi(file) {
    var folder, i, len, ref, results;
    if (this.folders.length === 0) {
      return this.increase();
    }
    ref = this.folders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      folder = ref[i];
      if (file) {
        if (-1 === file.indexOf(folder.bare)) {
          continue;
        }
      }
      results.push(this.single({
        sFile: folder.src + path.sep + "index.less",
        sFolder: folder.src,
        dFile: this.map + path.sep + folder.name + ".css",
        name: folder.name
      }));
    }
    return results;
  }

  single({sFile, sFolder, dFile, name}) {
    return fs.readFile(sFile, "utf8", (e, res) => {
      if (e) {
        this.notify(e.message);
        log.error(`${this.server.config.title} - Less`, `${e}`);
        return this.increase();
      }
      // Create folder structure for the .css file
      return fs.mkdirp(this.map).then(() => {
        // Create less file
        return less.render(res, {
          paths: [sFolder],
          compress: this.server.env === "production"
        }, (e, output) => {
          var css;
          // In case of an error in the .less file
          if (e) {
            this.notify(`${e.filename}\nLine: ${e.line}\n${e.type} error - ${e.message}`);
            log.error(`${this.server.config.title} - Less`, "\n", `${e.filename}\nLine: ${e.line}\nColumn: ${e.column}\n${e.type} error\n${e.message}\nExtract:`, e.extract);
            return this.increase();
          }
          if (!(css = output != null ? output.css : void 0) && (css !== "")) {
            this.notify("No css output, check terminal");
            log.error(`${this.server.config.title} - Less`, `No css output: ${output}`);
            return this.increase();
          }
          // Write css file to destination
          return fs.writeFile(dFile, css, (e) => {
            var prefix;
            // In case of an error in the .less file
            if (e) {
              log.error(`${this.server.config.title} - Less`, e);
              return this.increase();
            }
            // Define prefix
            if (name) {
              prefix = `${name}: `;
            } else {
              prefix = "";
            }
            this.server.vent.emit("compiled:file", {
              file: dFile,
              title: `${this.server.config.title} - Less`,
              message: prefix + dFile.replace(this.server.root + path.sep, "")
            });
            return this.increase();
          });
        });
      });
    });
  }

  increase() {
    if (this.done) {
      return;
    }
    // Set bool
    this.done = true;
    // Notify watcher for the initialized trigger
    return this.server.vent.emit("watch:increase", this.count);
  }

  notify(message, name) {
    return notifier.notify({
      title: `${this.server.config.title} - Less - ${name}`,
      message: message
    });
  }

};

module.exports = Less;
