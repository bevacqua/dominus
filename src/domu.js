'use strict';

var $ = qs('querySelectorAll');
$.one = qs('querySelector');

function qs (query) {
  return function queryHandler (elem, selector) {
    if (selector === void 0) {
      selector = elem; elem = void 0;
    }
    return (elem || document)[query](selector);
  }
}

module.exports = $;
/*

    Node.prototype.on = Node.prototype.addEventListener;
    Node.prototype.remove = function () { this.parentNode.removeChild(this); };
    Node.prototype.txt = function (v) { if (v === void 0) { return this.innerText; } this.innerText = v; }
    Node.prototype.html = function (v) { if (v === void 0) { return this.innerHTML; } this.innerHTML = v; }
    Node.prototype.attr = function (n, v) { if (v === void 0) { return this.getAttribute(n); } this.setAttribute(n, v); }
*/
