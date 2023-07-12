// Node
var Less, fs, less, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

less = require("less");

Less = class Less {
  constructor(server) {
    this.process = this.process.bind(this);
    this.server = server;
    this.server.less = {
      process: this.process
    };
    this.setup();
  }

  setup() {
    var e, stats;
    if (this.server.config.type === 2) {
      return;
    }
    // Short refrence to less config
    this.config = this.server.config.less;
    // Create path to less entry file and folder
    if (this.server.config.type === 3) {
      this.folder = this.server.folders.src.index;
    } else {
      this.folder = this.server.folders.src.client;
    }
    this.folder += path.sep + this.config.folder;
    this.folder = this.folder.replace(this.server.root + path.sep, "");
    this.entry = this.folder + path.sep + this.config.entry;
    // Create path to destination file and folder
    if (this.server.config.type === 3) {
      this.map = this.server.folders.temp.index;
    } else {
      this.map = this.server.folders.temp.client;
    }
    this.map += path.sep + this.config.folder;
    this.map = this.map.replace(this.server.root + path.sep, "");
    this.destination = this.map + path.sep + this.config.file;
    try {
      stats = fs.statSync(this.entry);
    } catch (error) {
      e = error;
    }
    if (e) {
      this.type = "multi";
      this.determin();
    } else {
      this.type = "single";
    }
    return log.info(`${this.server.config.title} - Less`, `Type: ${this.type}`);
  }

  determin() {
    log.debug(`${this.server.config.title} - Less`, `Entry file not found: ${this.entry}`);
    // Store multi setup folders
    this.folders = [];
    // Read all files in entry folder
    return fs.readdir(this.server.root + path.sep + this.folder, (e, files) => {
      var file, folder, i, len;
      if (e) {
        return log.error(`${this.server.config.title} - Less`, e);
      }
// Loop over all results
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (!fs.statSync(this.server.root + path.sep + (folder = this.folder + path.sep + file)).isDirectory()) {
          // Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
          continue;
        }
        // Add less bundle folders
        this.folders.push({
          path: folder,
          name: file
        });
      }
      if (this.folders.length === 0) {
        return log.error(`${this.server.config.title} - Less`, "No folders are found for a multi setup");
      }
    });
  }

  process(file) {
    return new Promise(async(resolve) => {
      var dFile, dFiles;
      if (this.server.config.type === 2) {
        return resolve();
      }
      if (file) {
        log.info(`${this.server.config.title} - Less`, "Init");
      }
      if (this.type === "multi") {
        dFiles = (await this.multi(file));
      } else if (this.type === "single") {
        dFile = (await this.single({
          sFile: this.entry,
          sFolder: this.folder,
          dFile: this.destination
        }));
        dFiles = [dFile];
      }
      return resolve(dFiles);
    });
  }

  multi(file) {
    return new Promise(async(resolve) => {
      var dFiles, folder, i, key, len, list, promise, ref, sFile;
      if (this.folders.length === 0) {
        return resolve();
      }
      list = {};
      ref = this.folders;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (file && -1 === file.indexOf(folder.path)) {
          continue;
        }
        list[sFile = folder.path + path.sep + "index.less"] = this.single({
          sFile: sFile,
          sFolder: folder.path,
          dFile: this.map + path.sep + folder.name + ".css",
          dFolder: folder.name
        });
      }
      dFiles = [];
      for (key in list) {
        promise = list[key];
        dFiles.push((await promise));
      }
      return resolve(dFiles);
    });
  }

  single({sFile, sFolder, dFile, dFolder}) {
    var map;
    dFile = this.server.toDestination(dFile);
    map = this.server.toDestination(this.map);
    return new Promise(async(resolve) => {
      var e, res;
      try {
        res = (await fs.readFile(this.server.root + path.sep + sFile, "utf8"));
      } catch (error) {
        e = error;
        log.error(`${this.server.config.title} - Less`, e.stack);
        return resolve();
      }
      try {
        await fs.mkdirp(this.server.root + path.sep + map);
      } catch (error) {
        e = error;
        log.error(`${this.server.config.title} - Less`, e.stack);
        return resolve();
      }
      return less.render(res, {
        paths: [this.server.root + path.sep + sFolder],
        compress: this.server.env === "production"
      }, async(e, output) => {
        var css, prefix;
        if (e) {
          log.error(`${this.server.config.title} - Less`, "\n", `${e.filename}\nLine: ${e.line}\nColumn: ${e.column}\n${e.type} error\n${e.message}\nExtract:`, e.extract);
          return resolve();
        }
        if (!(css = output != null ? output.css : void 0) && (css !== "")) {
          log.error(`${this.server.config.title} - Less`, `No css output: ${output}`);
          return resolve();
        }
        try {
          await fs.writeFile(this.server.root + path.sep + dFile, css);
        } catch (error) {
          e = error;
          log.error(`${this.server.config.title} - Less`, e.stack);
          return resolve();
        }
        prefix = dFolder ? `${dFolder}: ` : "";
        log.info(`${this.server.config.title} - Less`, prefix + dFile);
        return resolve(dFile);
      });
    });
  }

};

module.exports = Less;
