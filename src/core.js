'use strict';

var test = require('./test');
var Dominus = require('./Dominus.ctor');

function Applied (args) {
  return Dominus.apply(this, args);
}

Applied.prototype = Dominus.prototype;

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
  return new Applied(a).filter(function (i) {
    return test.isElement(i);
  });
}

function flatten (a) {
  return a.reduce(function (current, item) {
    if (Dominus.isArray(item)) {
      return current.concat(flatten(item));
    } else {
      return current.concat(item);
    }
  }, new Dominus());
}

module.exports = {
  cast: cast,
  flatten: flatten
};
