(function() {
  var merge;

  merge = function(obj1, obj2) {
    var p;
    for (p in obj2) {
      if (!obj2.hasOwnProperty(p)) {
        return;
      }
      if (typeof obj2[p] === 'object') {
        obj1[p] = merge(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    }
    return obj1;
  };

  module.exports = merge;

}).call(this);
