# --------------------------------------------------
#	Merge ~ Merges two objects
# --------------------------------------------------
merge = (obj1, obj2) ->

	for p of obj2
		try
			if typeof obj2[p] is 'object'
				obj1[p] = merge obj1[p], obj2[p]
			else
				obj1[p] = obj2[p]
		catch e
			obj1[p] = obj2[p]

	return obj1



module.exports = merge