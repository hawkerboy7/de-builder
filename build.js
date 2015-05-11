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
		"enabled": true,
		"file": "app.js"
	},
	"type": 1
}