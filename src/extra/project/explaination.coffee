# --------------------------------------------------
#	Explaination ~ Provides insight in setup type
# --------------------------------------------------
Explaination = (type) ->

	message = 'Project type "'
	message += 'Server-Client'			if type is 1
	message += 'Server'					if type is 2
	message += 'Client (NodeWebkit)'	if type is 3
	message += '" has been set-up!'



module.exports = Explaination