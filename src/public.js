'use strict';

var dom = require('./dom');

function api (selector, context) {
  return dom.qsa(context, selector);
};

api.find = api;
api.findOne = function (selector, context) {
  return dom.qs(context, selector);
};

module.exports = api;
