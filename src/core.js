'use strict';

var poser = require('poser');
var Dominus = poser.Array();

function dns () { return new Dominus(); }

function cast (a) {
  var result;

  if (a instanceof Dominus) {
    return a;
  }
  result = dns();
  result.push.apply(result, a);
  return result;
}

function flatten (a, d) {
  var depth = d || 1;
  return a.reduce(function (current, item) {
    if (Dominus.isArray(item)) {
      return current.concat(flatten(item, depth + 1));
    } else {
      return current.concat(item);
    }
  }, dns());
}

function flat (fn) {
  var mapped = this.map(fn);
  var flattened = flatten(mapped);
  return flattened;
}

module.exports = {
  Dominus: Dominus,
  cast: cast,
  flat: flat
};
