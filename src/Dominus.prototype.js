'use strict';

var core = require('./core');
var dom = require('./dom');
var Dominus = require('./Dominus.ctor');

Dominus.prototype.find = function (selector) {
  return core.flat.call(this, function (elem) {
    return dom.qsa(elem, selector);
  });
};

Dominus.prototype.findOne = function (selector) {
  return core.flat.call(this, function (elem) {
    return dom.qs(elem, selector);
  })[0];
};

Dominus.prototype.on = function (types, fn) {
  this.forEach(function (elem) {
    types.forEach(function (type) {
      dom.on(elem, type, fn);
    });
  });
  return this;
};

function keyValue (key, value) {
  if (value === void 0) {
    return this.length ? dom[key](this[0]) : '';
  } else {
    this.forEach(function (elem) {
      dom[key](elem, value);
    });
    return this;
  }
}

function keyValueProperty (prop) {
  Dominus.prototype[prop] = function (value) {
    return keyValue.call(this, prop, value);
  };
}

['html', 'text', 'value'].forEach(keyValueProperty);

module.exports = require('./public');
