'use strict';

var sizzle = require('sizzle');
var Dominus = require('./Dominus.ctor');
var api = module.exports = {};

api.qsa = function (elem, selector) {
  var results = new Dominus();
  return sizzle(selector, elem, results);
};

api.qs = function (elem, selector) {
  return api.qsa(elem, selector)[0];
};

api.on = function (elem, type, fn) {
  elem.addEventListener(type, fn);
};

function getSet (key, elem, value) {
  if (value === void 0) {
    return elem[key];
  } else {
    elem[key] = value;
  }
}

function getSetProperty (prop) {
  api[prop] = getSet.bind(null, prop);
}

['html', 'text', 'value'].forEach(getSetProperty);
