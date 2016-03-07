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
    folder: 'styles'
  },
  forever: {
    file: 'app.js',
    enabled: true
  },
  debug: false,
  browserify: {
    file: 'app.js',
    debug: true,
    folder: 'js'
  },
  browserSync: {
    enabled: true
  },
  type: 1
};

module.exports = config;
