'use strict';

var sizzle = require('sizzle');
var Dominus = require('./Dominus.ctor');
var events = require('./events');
var api = module.exports = {};

api.qsa = function (elem, selector) {
  var results = new Dominus();
  return sizzle(selector, elem, results);
};

api.qs = function (elem, selector) {
  return api.qsa(elem, selector)[0];
};

api.on = function (elem, type, fn) {
  events.add(elem, type, fn);
};

api.html = function (elem, html) {
  if (html === void 0) {
    return elem.innerHTML;
  } else {
    elem.innerHTML = html;
  }
};

api.text = function (elem, text) {
  var checkable = elem.checked !== void 0;
  if (text === void 0) {
    return checkable ? elem.value : elem.innerText || elem.textContent;
  } else if (checkable) {
    elem.value = text;
  } else {
    elem.innerText = elem.textContent = text;
  }
};

api.value = function (elem, value) {
  var checkable = elem.checked !== void 0;
  if (value === void 0) {
    return checkable ? elem.checked : elem.value;
  } else if (checkable) {
    elem.checked = value;
  } else {
    elem.value = value;
  }
};
