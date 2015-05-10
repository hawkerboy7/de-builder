# --------------------------------------------------
#	Explaination ~ Provides insight in setup type
# --------------------------------------------------
Explaination = (type) ->

	message = 'Setting up new "'
	message += 'Server-Client'	if type is 1
	message += 'Server'			if type is 2
	message += 'NodeWebkit'		if type is 3
	message += '" project'



module.exports = Explaination