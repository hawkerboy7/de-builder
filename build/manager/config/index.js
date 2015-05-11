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
      folder: 'js'
    },
    forever: {
      enabled: true,
      file: 'app.js'
    },
    browserSync: {
      enabled: true
    },
    type: 1
  };

  module.exports = config;

}).call(this);
