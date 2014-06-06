'use strict';

var d = global.document;
var flatten = require('flatten');
var a = require('./a');
var atoa = require('./atoa');

function qs (selector, context) {
  var result = (context || d).querySelector(selector);
  return wrap(result);
}

function qsa (selector, context) {
  var result = (context || d).querySelectorAll(selector);
  return wrap(atoa(result).map(wrap));
}

function wrap (n) {
  var b = a(n);
  var s = b ? n[0] : n;
  var m = b ? n : [n];

  n.find = function (selector) {
    if (b) {
      return many(n, 'find', [selector, n]);
    }
    return qsa(selector, n);
  };
  n.html = function (value) {
    if (arguments.length === 0) {
      return s.innerHTML;
    } else {
      s.innerHTML = value;
    }
  };
  n.on = function (type, fn) {
    m.forEach(function (i) {
      i.addEventListener(type, fn);
    });
    return n;
  };
  return n;
}

function many (n, fn, args) {
  return wrap(flatten(n.map(function (i) {
    return i[fn].apply(i, args);
  })));
}

var $ = qsa;

$.one = qs;

module.exports = $;
