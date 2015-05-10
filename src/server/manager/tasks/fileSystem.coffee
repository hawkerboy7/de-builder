# --------------------------------------------------
#	Coffee ~ Compiles all .coffee files
# --------------------------------------------------
fs		= require 'fs'
log		= require 'de-logger'
path	= require 'path'
mkdirp	= require 'mkdirp'



class FileSystem

	constructor: (@server) ->


	compile: (parts) ->

		[filePath,_compile,task,extentions] = parts;

		# Read file
		fs.readFile filePath, 'utf8', (err,file) =>

			# Notify if mkdirp failed
			return log.error 'LDE - FileSystem', "Unable to readFile #{filePath}\n\n", err if err

			# Set filePath for FileSystem file
			newPath = filePath.replace "#{@server.options.root}/#{@server.options.src}", "#{@server.options.root}/#{@server.options.build}"

			# Set new file extentions
			newPath = newPath.replace "#{extentions.src}", "#{extentions.target}" if extentions

			# Directory of the newPath
			dirPath = path.dirname newPath

			# Don't create folder if using less
			dirPath = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.less.folder}" if extentions?.src is '.less'

			# Make new filePath folders if the filePath doesn't exist
			mkdirp dirPath, (err) =>

				# Notify if mkdirp failed
				return log.error 'LDE - FileSystem', "Unable to create #{dirPath}\n\n", err if err

				# File is a server file
				server = true

				# Check if server or client
				server = false if -1 is filePath.indexOf "#{@server.options.root}/#{@server.options.src}/#{@server.options.server}"

				# Compile task specific file
				_compile { file: file, server: server, filePath: filePath }, (err,result) =>

					# Notify if mkdirp failed
					return log.error "LDE - _Compile #{task}", "Unable to compile #{filePath}\n\n", err if err

					# Set less path
					if extentions?.src is '.less'
						newPath = "#{@server.options.root}/#{@server.options.build}/#{@server.options.client}/#{@server.options.less.folder}/#{@server.options.less.file}".replace "#{extentions.src}", "#{extentions.target}"

					# log.info "LDE - #{task}", "Writing ~ " + newPath.replace "#{@server.options.root}/", ''
					# Notify succes
					log.info "LDE - #{task}", "#{@server.symbols.finished} " + newPath.replace "#{@server.options.root}/", ''

					# Write result to newPath file
					fs.writeFile newPath, result, (err) =>

						# Notify if write file failed
						return log.error 'LDE - FileSystem', "Unable to write file #{newPath}\n\n", err if err

						# Notify server of this coffee compile
						# @server.events.emit "#{task}-server"
						# @server.events.emit "#{task}-client"



module.exports = FileSystem