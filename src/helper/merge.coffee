# --------------------------------------------------
#	Merge ~ Merges two objects
# --------------------------------------------------
merge = (obj1, obj2) ->

	for p of obj2

		# Own property guard
		return if not obj2.hasOwnProperty p

		if typeof obj2[p] is 'object'
			obj1[p] = merge obj1[p], obj2[p]
		else
			obj1[p] = obj2[p]

	return obj1



module.exports = merge