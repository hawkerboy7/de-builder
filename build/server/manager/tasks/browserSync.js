var BrowserSync, browserSync;

browserSync = require('browser-sync');

BrowserSync = (function() {
  function BrowserSync(server) {
    this.server = server;
  }

  return BrowserSync;

})();

module.exports = BrowserSync;
