/**
 * domu - Lean DOM Manipulation
 * @version v1.0.1
 * @link https://github.com/bevacqua/domu
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.domu=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbmljby9uaWNvL2dpdC9kb211L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmljby9uaWNvL2dpdC9kb211L3NyYy9kb211LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcXMoJ3F1ZXJ5U2VsZWN0b3JBbGwnKTtcbiQub25lID0gcXMoJ3F1ZXJ5U2VsZWN0b3InKTtcblxuZnVuY3Rpb24gcXMgKHF1ZXJ5KSB7XG4gIHJldHVybiBmdW5jdGlvbiBxdWVyeUhhbmRsZXIgKGVsZW0sIHNlbGVjdG9yKSB7XG4gICAgaWYgKHNlbGVjdG9yID09PSB2b2lkIDApIHtcbiAgICAgIHNlbGVjdG9yID0gZWxlbTsgZWxlbSA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIChlbGVtIHx8IGRvY3VtZW50KVtxdWVyeV0oc2VsZWN0b3IpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gJDtcbi8qXG5cbiAgICBOb2RlLnByb3RvdHlwZS5vbiA9IE5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgTm9kZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkgeyB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7IH07XG4gICAgTm9kZS5wcm90b3R5cGUudHh0ID0gZnVuY3Rpb24gKHYpIHsgaWYgKHYgPT09IHZvaWQgMCkgeyByZXR1cm4gdGhpcy5pbm5lclRleHQ7IH0gdGhpcy5pbm5lclRleHQgPSB2OyB9XG4gICAgTm9kZS5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uICh2KSB7IGlmICh2ID09PSB2b2lkIDApIHsgcmV0dXJuIHRoaXMuaW5uZXJIVE1MOyB9IHRoaXMuaW5uZXJIVE1MID0gdjsgfVxuICAgIE5vZGUucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAobiwgdikgeyBpZiAodiA9PT0gdm9pZCAwKSB7IHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShuKTsgfSB0aGlzLnNldEF0dHJpYnV0ZShuLCB2KTsgfVxuKi9cbiJdfQ==
(1)
});
