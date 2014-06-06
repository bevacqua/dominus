'use strict';

var flatten = require('flatten');
var atoa = require('./atoa');

function qs (selector, context) {
  var result = (context || document).querySelector(selector);
  return wrap(result);
}

function qsa (selector, context) {
  var result = (context || document).querySelectorAll(selector);
  return wrapa(atoa(result).map(wrap));
}

function wrap (n) {
  n.find = function (selector) {
    return qsa(selector, n);
  };
  return n;
}

function wrapa (n) {
  n.find = function (selector) {
    return wrapa(flatten(n.map(function flatmap (i) {
      return qsa(selector, i);
    })));
  };
  return n;
}

var $ = qsa;

$.one = qs;

module.exports = $;
/*

    Node.prototype.on = Node.prototype.addEventListener;
    Node.prototype.remove = function () { this.parentNode.removeChild(this); };
    Node.prototype.txt = function (v) { if (v === void 0) { return this.innerText; } this.innerText = v; }
    Node.prototype.html = function (v) { if (v === void 0) { return this.innerHTML; } this.innerHTML = v; }
    Node.prototype.attr = function (n, v) { if (v === void 0) { return this.getAttribute(n); } this.setAttribute(n, v); }
*/
