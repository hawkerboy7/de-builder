require('de-builder')({
	"src": "src",
	"build": "build",
	"client": "client",
	"server": "server",
	"less": {
		"file": "app.less",
		"folder": "styles"
	},
	"browserify": {
		"file": "app.js",
		"folder": "js"
	},
	"forever": {
		"enabled": false,
		"file": "app.js"
	},
	"browserSync": {
		"enabled": true
	},
	"type": 1
});