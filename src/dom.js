'use strict';

var core = require('./core');

function on (elem, type, fn) {
  elem.addEventListener(type, fn);
}

function html (elem, value) {
  if (arguments.length === 1) {
    return elem.innerHTML;
  } else {
    elem.innerHTML = value;
  }
}

function qsa (elem, selector) {
  var results = new core.Dominus();
  return Sizzle(selector, elem, results);
}

function qs (elem, selector) {
  return qsa(elem, selector)[0];
}

module.exports = {
  on: on,
  html: html,
  qsa: qsa,
  qs: qs
};
