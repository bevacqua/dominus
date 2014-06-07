'use strict';

var test = require('./test');
var Dominus = require('./Dominus.ctor');

function cast (a) {
  if (a instanceof Dominus) {
    return a;
  }
  if (!a) {
    return new Dominus();
  }
  if (test.isElement(a)) {
    return new Dominus(a);
  }
  if (!test.isArray(a)) {
    return new Dominus();
  }
  return Dominus.prototype.filter.call(a, function (i) {
    return test.isElement(i);
  });
}

function flatten (a, d) {
  var depth = d || 1;
  return a.reduce(function (current, item) {
    if (Dominus.isArray(item)) {
      return current.concat(flatten(item, depth + 1));
    } else {
      return current.concat(item);
    }
  }, new Dominus());
}

function flat (fn) {
  var mapped = this.map(fn);
  var flattened = flatten(mapped);
  return flattened;
}

module.exports = {
  cast: cast,
  flat: flat
};
