// Node
var Project, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

Project = class Project {
  constructor(server) {
    this.clean = this.clean.bind(this);
    this.type = this.type.bind(this);
    this.server = server;
  }

  init() {
    log.info(`${this.server.config.title} - Project`, "Setup project folders");
    return new Promise(async(resolve) => {
      this.folders();
      await this.clean();
      await this.type();
      return resolve();
    });
  }

  folders() {
    var build, src, temp;
    return this.server.folders = {
      src: {
        index: src = `${this.server.root}${path.sep}${this.server.config.src}`,
        server: `${src}${path.sep}${this.server.config.server}`,
        client: `${src}${path.sep}${this.server.config.client}`
      },
      temp: {
        index: temp = `${this.server.root}${path.sep}${this.server.config.temp}`,
        server: `${temp}${path.sep}${this.server.config.server}`,
        client: `${temp}${path.sep}${this.server.config.client}`
      },
      build: {
        index: build = `${this.server.root}${path.sep}${this.server.config.build}`,
        server: `${build}${path.sep}${this.server.config.server}`,
        client: `${build}${path.sep}${this.server.config.client}`
      }
    };
  }

  clean() {
    return new Promise(async(resolve) => {
      var e;
      try {
        await fs.remove(this.server.folders.temp.index);
        if (!this.server.initialized) {
          await fs.mkdirp(this.server.folders.temp.index);
        }
        log.info(`${this.server.config.title} - Clean`, this.server.symbols.finished);
        return resolve();
      } catch (error) {
        e = error;
        return log.error(`${this.server.config.title} - Clean - Error`, e.stack);
      }
    });
  }

  type() {
    return new Promise(async(resolve) => {
      if (this.server.config.type === 1) {
        await fs.mkdirp(this.server.folders.src.client);
        await fs.mkdirp(this.server.folders.src.server);
        if (!this.server.initialized) {
          await fs.mkdirp(this.server.folders.temp.client);
          await fs.mkdirp(this.server.folders.temp.server);
        }
      } else {
        await fs.mkdirp(this.server.folders.src.index);
        if (!this.server.initialized) {
          await fs.mkdirp(this.server.folders.temp.index);
        }
      }
      // Notify project type
      log.info("LDE - Project", this.explaination());
      return resolve();
    });
  }

  explaination() {
    var message, type;
    type = this.server.config.type;
    message = "Project type \"";
    if (type === 1) {
      message += "Server-Client";
    }
    if (type === 2) {
      message += "Server";
    }
    if (type === 3) {
      message += "Client";
    }
    return message += "\" is used";
  }

};

module.exports = Project;
