var config;

config = {
  title: 'LDE',
  fullTitle: 'Live Development Environment',
  io: {
    port: 8009,
    host: 'localhost'
  },
  src: 'src',
  build: 'build',
  client: 'client',
  server: 'server',
  less: {
    file: 'app.css',
    entry: 'app.less',
    folder: 'styles-multi-error'
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
