'use strict';

var sizzle = require('sizzle');
var Dominus = require('./Dominus.ctor');
var events = require('./events');
var text = require('./text');
var test = require('./test');
var api = module.exports = {};

api.qsa = function (elem, selector) {
  var results = new Dominus();
  return sizzle(selector, elem, results);
};

api.qs = function (elem, selector) {
  return api.qsa(elem, selector)[0];
};

api.matches = function (elem, selector) {
  return sizzle.matchesSelector(elem, selector);
};

api.on = function (elem, type, fn) {
  events.add(elem, type, fn);
};

api.html = function (elem, html) {
  var getter = arguments.length < 2;
  if (getter) {
    return elem.innerHTML;
  } else {
    elem.innerHTML = html;
  }
};

api.text = function (elem, text) {
  var checkable = test.isCheckable(elem);
  var getter = arguments.length < 2;
  if (getter) {
    return checkable ? elem.value : elem.innerText || elem.textContent;
  } else if (checkable) {
    elem.value = text;
  } else {
    elem.innerText = elem.textContent = text;
  }
};

api.value = function (elem, value) {
  var checkable = test.isCheckable(elem);
  var getter = arguments.length < 2;
  if (getter) {
    return checkable ? elem.checked : elem.value;
  } else if (checkable) {
    elem.checked = value;
  } else {
    elem.value = value;
  }
};

api.attr = function (elem, name, value) {
  var getter = arguments.length < 3;
  var camel = text.hyphenToCamel(name);
  if (getter) {
    if (camel in elem) {
      return elem[camel];
    } else {
      return elem.getAttribute(name, value);
    }
  }
  if (camel in elem) {
    elem[camel] = value;
  } else if (value === null || value === void 0) {
    elem.removeAttribute(name);
  } else {
    elem.setAttribute(name, value);
  }
};
