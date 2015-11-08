(function() {
  var config;

  config = {
    src: 'src',
    build: 'build',
    client: 'client',
    server: 'server',
    less: {
      file: 'app.less',
      folder: 'styles'
    },
    browserify: {
      file: 'app.js',
      debug: true,
      folder: 'js'
    },
    forever: {
      file: 'app.js',
      enabled: true
    },
    browserSync: {
      enabled: true
    },
    type: 1,
    debug: false
  };

  module.exports = config;

}).call(this);
