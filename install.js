// --------------------------------------------------
//	Install ~ Creates a build.js file
// --------------------------------------------------
"use strict"

var fs = require('fs');
var log = require('de-logger');
var path = require('path');

// ### TO DO: improve this file so it displays all default options too ###

// File content
var file = "require('de-builder')();";

// File name
var name = "build.js";

// File location
var location = path.resolve('../../'+name);

// Create build.js file
fs.writeFile(location, file, function (err) {
	if (!err) return;
	log.warn('LDE - Project', 'Couldn\'t create build.js file');
	log.error('LDE - Project', err);
});