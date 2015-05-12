(function() {
  var merge;

  merge = function(obj1, obj2) {
    var e, p;
    for (p in obj2) {
      try {
        if (typeof obj2[p] === 'object') {
          obj1[p] = merge(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } catch (_error) {
        e = _error;
        obj1[p] = obj2[p];
      }
    }
    return obj1;
  };

  module.exports = merge;

}).call(this);
