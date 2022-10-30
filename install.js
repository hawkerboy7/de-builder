// --------------------------------------------------
// Install ~ Creates a build.js file with all default options
// --------------------------------------------------
"use strict"

var fs = require("fs");
var log = require("de-logger");
var path = require("path");
var config = require(["de-builder","build","server","config"].join(path.sep));

// File content
var file = "require(\"de-builder\")("+JSON.stringify(config, null, "\t")+");";

// File name
var name = "build.js";

// File location
var location = path.resolve(["..","..",name].join(path.sep));

fs.exists(location, function(exists) {

	// Only create file if it does not exists yet
	if (exists) { return log.info("LDE - Install", "build.js file already exists"); }

	// Create build.js file
	fs.writeFile(location, file, function (err) {
		if (!err) { return; }
		log.error("LDE - Install", "Couldn\"t create build.js file");
		log.error("LDE - Install", err);
	});
});
