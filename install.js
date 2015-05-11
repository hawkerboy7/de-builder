// --------------------------------------------------
//	Install ~ Creates a build.js file
// --------------------------------------------------
"use strict"

var fs = require('fs');
var log = require('de-logger');
var path = require('path');
var config = require('./build/server/manager/config');

// File content
var file = "require('de-builder')("+JSON.stringify(config, null, '\t');+");";

// File name
var name = "build.js";

// File location
var location = path.resolve('../../'+name);

fs.exists(location, function(exists) {

	// Only create file if it doesn't exists yet
	if (exists) { return log.info('LDE - Project', 'build.js file already exists'); }

	// Create build.js file
	fs.writeFile(location, file, function (err) {
		if (!err) return;
		log.warn('LDE - Project', 'Couldn\'t create build.js file');
		log.error('LDE - Project', err);
	});
});