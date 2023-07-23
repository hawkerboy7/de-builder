// Node
var Forever, fork, log, path;

path = require("path");

({fork} = require("child_process"));

// NPM
log = require("de-logger");

Forever = class Forever {
  constructor(server) {
    this.exit = this.exit.bind(this);
    this.start = this.start.bind(this);
    this.terminate = this.terminate.bind(this);
    this.server = server;
    this.listeners();
    this.server.forever = {
      run: this.start
    };
  }

  listeners() {
    return process.on("exit", this.exit);
  }

  exit(code) {
    log.info(`${this.server.config.title} - Watch`, "~ And Now My Watch Is Ended ~");
    return this.terminate();
  }

  async start() {
    var entry, src;
    // Ensure no previous instance is runnning
    await this.terminate();
    // Determin the src directory
    src = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      src = this.server.folders.build.index;
    }
    // Create file path
    entry = src + path.sep + this.server.config.forever.entry;
    this.child = fork(entry, {
      stdio: "pipe"
    });
    this.child.stdout.pipe(process.stdout);
    this.child.stderr.pipe(process.stderr);
    return this.child.on("close", (code, signal) => {
      if (code === null) {
        return;
      }
      return log.info(`${this.server.config.title} - Forever`, `Process exit with code ${code}`);
    });
  }

  terminate() {
    return new Promise((resolve) => {
      if (!this.child) {
        // No child to terminate
        return resolve();
      }
      if (this.child.exitCode !== null) {
        // Child has already stopped running
        return resolve();
      }
      if (!this.child.kill("SIGTERM")) {
        // Request the child to terminate, but kill it if it does not
        this.child.kill("SIGKILL");
      }
      return resolve();
    });
  }

};

module.exports = Forever;
