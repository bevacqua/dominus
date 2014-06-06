'use strict';

module.exports = function (o) {
  return Object.prototype.toString(o) === '[object Array]';
};
