// NPM
var Exit, log;

log = require("de-logger");

Exit = class Exit {
  constructor(server) {
    this.exit = this.exit.bind(this);
    this.uncaughtException = this.uncaughtException.bind(this);
    this.sigint = this.sigint.bind(this);
    this.sigterm = this.sigterm.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    this.readInput();
    process.on("exit", this.exit);
    process.on("SIGINT", this.sigint);
    process.on("SIGTERM", this.sigterm);
    process.on("command", this.command);
    return process.on("uncaughtException", this.uncaughtException);
  }

  readInput() {
    // Set encoding
    process.stdin.setEncoding("utf8");
    // Listen for terminal user input (leaves the process running too)
    return process.stdin.on("data", function(command) {
      // Send terminal command through the application - Remove the \n from the command
      return process.emit("command", command.slice(0, -1));
    });
  }

  exit(code) {
    this.server.vent.emit("terminate:child");
    return log.info(this.server.config.title, "Exit:", code);
  }

  uncaughtException(e) {
    console.log("");
    return log.warn(this.server.config.title, "Uncaught Exception Found\n\n", e.stack);
  }

  sigint() {
    console.log("");
    log.info(this.server.config.title, "Application Interrupted");
    return process.exit(130);
  }

  sigterm() {
    console.log("");
    log.info(this.server.config.title, "Application Terminated");
    return process.exit(143);
  }

  command(command) {
    if (command === "exit") {
      // Exit process
      return process.exit();
    }
  }

};

// Log command
// log.event "command", command
module.exports = Exit;
