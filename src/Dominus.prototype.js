'use strict'

var core = require('./core');
var dom = require('./dom');
var Dominus = require('./Dominus.ctor');

Dominus.prototype.on = function (type, fn) {
  this.forEach(function (elem) {
    dom.on(elem, type, fn);
  });
  return this;
};

Dominus.prototype.html = function (value) {
  if (arguments.length === 0) {
    return this.length ? dom.html(this[0]) : '';
  } else {
    this.forEach(function (elem) {
      dom.html(elem, value);
    });
    return this;
  }
};

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

module.exports = require('./public');
