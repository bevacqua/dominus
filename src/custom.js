'use strict';

var handlers = {};

function register (name, type, fn) {
  handlers[type] = {
    event: type,
    filter: fn,
    wrap: wrap
  };

  function wrap (fn) {
    return wrapper(type, fn);
  }
}

function wrapper (type, fn) {
  var key = '__dce_' + type;
  if (fn[key]) {
    return fn[key];
  }
  fn[key] = function customEvent (e) {
    var match = handlers[type].filter(e);
    if (match) {
      return fn.apply(this, arguments);
    }
  };
  return fn[key];
}

register('left-click', 'click', function (e) {
  return e.which === 1 && !e.metaKey && !e.ctrlKey;
});

module.exports = {
  register: register,
  wrapper: wrapper,
  handlers: handlers
};
