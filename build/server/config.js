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
    entry: 'app.js',
    enabled: true
  },
  browserify: {
    single: {
      entry: 'app.coffee',
      bundle: 'app.bundle.js'
    },
    multi: 'bundle.js',
    debug: true,
    folder: 'js'
  },
  browserSync: {
    enabled: true,
    multi: ['vendor']
  },
  type: 1,
  debug: false
};

module.exports = config;
