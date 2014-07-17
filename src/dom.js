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

api.html = function (elem, html) {
  if (html === void 0) {
    return elem.innerHTML;
  } else {
    elem.innerHTML = html;
  }
};

api.text = function (elem, text) {
  if (text === void 0) {
    return elem.innerText || elem.textContent;
  } else {
    elem.innerText = elem.textContent = text;
  }
};

api.value = function (elem, value) {
  if (value === void 0) {
    return elem.value;
  } else {
    elem.value = value;
  }
};
