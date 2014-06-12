'use strict';

var dom = require('./dom');
var core = require('./core');

function api (selector, context) {
  if (arguments.length < 2 && typeof selector !== 'string') {
    return core.cast(selector);
  }
  return api.find(selector, context);
}

api.find = function (selector, context) {
  return dom.qsa(context, selector);
};

api.findOne = function (selector, context) {
  return dom.qs(context, selector);
};

module.exports = api;
