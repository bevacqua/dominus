(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dominus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = global.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./eventmap":2,"custom-event":3}],2:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
var poser = require('./src/node');

module.exports = poser;

['Array', 'Function', 'Object', 'Date', 'String'].forEach(pose);

function pose (type) {
  poser[type] = function poseComputedType () { return poser(type); };
}

},{"./src/node":5}],5:[function(require,module,exports){
(function (global){
'use strict';

var d = global.document;

function poser (type) {
  var iframe = d.createElement('iframe');

  iframe.style.display = 'none';
  d.body.appendChild(iframe);

  return map(type, iframe.contentWindow);
}

function map (type, source) { // forward polyfills to the stolen reference!
  var original = window[type].prototype;
  var value = source[type];
  var prop;

  for (prop in original) {
    value.prototype[prop] = original[prop];
  }

  return value;
}

module.exports = poser;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var expando = 'sektor-' + Date.now();
var rsiblings = /[+~]/;
var document = global.document;
var del = document.documentElement || {};
var match = (
  del.matches ||
  del.webkitMatchesSelector ||
  del.mozMatchesSelector ||
  del.oMatchesSelector ||
  del.msMatchesSelector ||
  never
);

module.exports = sektor;

sektor.matches = matches;
sektor.matchesSelector = matchesSelector;

function qsa (selector, context) {
  var existed, id, prefix, prefixed, adapter, hack = context !== document;
  if (hack) { // id hack for context-rooted queries
    existed = context.getAttribute('id');
    id = existed || expando;
    prefix = '#' + id + ' ';
    prefixed = prefix + selector.replace(/,/g, ',' + prefix);
    adapter = rsiblings.test(selector) && context.parentNode;
    if (!existed) { context.setAttribute('id', id); }
  }
  try {
    return (adapter || context).querySelectorAll(prefixed || selector);
  } catch (e) {
    return [];
  } finally {
    if (existed === null) { context.removeAttribute('id'); }
  }
}

function sektor (selector, ctx, collection, seed) {
  var element;
  var context = ctx || document;
  var results = collection || [];
  var i = 0;
  if (typeof selector !== 'string') {
    return results;
  }
  if (context.nodeType !== 1 && context.nodeType !== 9) {
    return []; // bail if context is not an element or document
  }
  if (seed) {
    while ((element = seed[i++])) {
      if (matchesSelector(element, selector)) {
        results.push(element);
      }
    }
  } else {
    results.push.apply(results, qsa(selector, context));
  }
  return results;
}

function matches (selector, elements) {
  return sektor(selector, null, null, elements);
}

function matchesSelector (element, selector) {
  return match.call(element, selector);
}

function never () { return false; }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
'use strict';

var poser = require('poser');
var Dominus = poser.Array();

module.exports = Dominus;

},{"poser":4}],8:[function(require,module,exports){
'use strict';

var $ = require('./public');
var flatten = require('./flatten');
var dom = require('./dom');
var custom = require('./custom');
var classes = require('./classes');
var Dominus = require('./Dominus.ctor');

function equals (selector) {
  return function equals (elem) {
    return dom.matches(elem, selector);
  };
}

function straight (prop, one) {
  return function domMapping (selector) {
    var result = this.map(function (elem) {
      return dom[prop](elem, selector);
    });
    var results = flatten(result);
    return one ? results[0] : results;
  };
}

Dominus.prototype.prev = straight('prev');
Dominus.prototype.next = straight('next');
Dominus.prototype.parent = straight('parent');
Dominus.prototype.parents = straight('parents');
Dominus.prototype.children = straight('children');
Dominus.prototype.find = straight('qsa');
Dominus.prototype.findOne = straight('qs', true);

Dominus.prototype.where = function (selector) {
  return this.filter(equals(selector));
};

Dominus.prototype.is = function (selector) {
  return this.some(equals(selector));
};

Dominus.prototype.i = function (index) {
  return this[index] ? new Dominus(this[index]) : new Dominus();
};

function compareFactory (fn) {
  return function compare () {
    $.apply(null, arguments).forEach(fn, this);
    return this;
  };
}

Dominus.prototype.and = compareFactory(function addOne (elem) {
  if (this.indexOf(elem) === -1) {
    this.push(elem);
  }
  return this;
});

Dominus.prototype.but = compareFactory(function addOne (elem) {
  var index = this.indexOf(elem);
  if (index !== -1) {
    this.splice(index, 1);
  }
  return this;
});

Dominus.prototype.css = function (name, value) {
  var props;
  var many = name && typeof name === 'object';
  var getter = !many && !value;
  if (getter) {
    return this.length ? dom.getCss(this[0], name) : null;
  }
  if (many) {
    props = name;
  } else {
    props = {};
    props[name] = value;
  }
  this.forEach(dom.setCss(props));
  return this;
};

function eventer (method) {
  return function (types, filter, fn) {
    var typelist = types.split(' ');
    if (typeof fn !== 'function') {
      fn = filter;
      filter = null;
    }
    this.forEach(function (elem) {
      typelist.forEach(function (type) {
        var handler = custom.handlers[type];
        if (handler) {
          dom[method](elem, handler.event, filter, handler.wrap(fn));
        } else {
          dom[method](elem, type, filter, fn);
        }
      });
    });
    return this;
  };
}

Dominus.prototype.once = eventer('once');
Dominus.prototype.on = eventer('on');
Dominus.prototype.off = eventer('off');
Dominus.prototype.emit = eventer('emit');

[
  ['addClass', classes.add],
  ['removeClass', classes.remove],
  ['setClass', classes.set],
  ['removeClass', classes.remove],
  ['remove', dom.remove]
].forEach(mapMethods);

function mapMethods (data) {
  Dominus.prototype[data[0]] = function (value) {
    this.forEach(function (elem) {
      data[1](elem, value);
    });
    return this;
  };
}

[
  'append',
  'appendTo',
  'prepend',
  'prependTo',
  'before',
  'beforeOf',
  'after',
  'afterOf'
].forEach(mapManipulation);

function mapManipulation (method) {
  Dominus.prototype[method] = function (value) {
    dom[method](this, value);
    return this;
  };
}

Dominus.prototype.hasClass = function (value) {
  return this.some(function (elem) {
    return classes.contains(elem, value);
  });
};

Dominus.prototype.attr = function (name, value) {
  var hash = name && typeof name === 'object';
  var set = hash ? setMany : setSingle;
  var setter = hash || arguments.length > 1;
  if (setter) {
    this.forEach(set);
    return this;
  } else {
    return this.length ? dom.getAttr(this[0], name) : null;
  }
  function setMany (elem) {
    dom.manyAttr(elem, name);
  }
  function setSingle (elem) {
    dom.attr(elem, name, value);
  }
};

function keyValue (key, value) {
  var getter = arguments.length < 2;
  if (getter) {
    return this.length ? dom[key](this[0]) : '';
  }
  this.forEach(function (elem) {
    dom[key](elem, value);
  });
  return this;
}

function keyValueProperty (prop) {
  Dominus.prototype[prop] = function accessor (value) {
    var getter = arguments.length < 1;
    if (getter) {
      return keyValue.call(this, prop);
    }
    return keyValue.call(this, prop, value);
  };
}

['html', 'text', 'value'].forEach(keyValueProperty);

Dominus.prototype.clone = function () {
  return this.map(function (elem) {
    return dom.clone(elem);
  });
};

Dominus.prototype.focus = function () {
  if (this.length) {
    this[0].focus();
  }
  return this;
};

module.exports = require('./public');

},{"./Dominus.ctor":7,"./classes":11,"./custom":12,"./dom":13,"./flatten":15,"./public":16}],9:[function(require,module,exports){
'use strict';

var Dominus = require('./Dominus.ctor');
var proto = Dominus.prototype;

function Applied (args) {
  return Dominus.apply(this, args);
}

Applied.prototype = proto;

function apply (a) {
  return new Applied(a);
}

['map', 'filter', 'concat', 'slice'].forEach(ensure);

function ensure (key) {
  var original = proto[key];
  proto[key] = function applied () {
    return apply(original.apply(this, arguments));
  };
}

module.exports = apply;

},{"./Dominus.ctor":7}],10:[function(require,module,exports){
(function (global){
'use strict';

var test = require('./test');
var apply = require('./apply');
var Dominus = require('./Dominus.ctor');

function cast (a) {
  if (a === global) {
    return new Dominus(a);
  }
  if (a instanceof Dominus) {
    return a;
  }
  if (!a) {
    return new Dominus();
  }
  if (test.isElement(a)) {
    return new Dominus(a);
  }
  if (!test.isArray(a)) {
    return new Dominus();
  }
  return apply(a).filter(function (i) {
    return test.isElement(i);
  });
}

module.exports = cast;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Dominus.ctor":7,"./apply":9,"./test":17}],11:[function(require,module,exports){
'use strict';

var trim = /^\s+|\s+$/g;
var whitespace = /\s+/g;
var test = require('./test');

function interpret (input) {
  return typeof input === 'string' ? input.replace(trim, '').split(whitespace) : input;
}

function classes (el) {
  if (test.isElement(el)) {
    return el.className.replace(trim, '').split(whitespace);
  }
  return [];
}

function set (el, input) {
  if (test.isElement(el)) {
    el.className = interpret(input).join(' ');
  }
}

function add (el, input) {
  var current = remove(el, input);
  var values = interpret(input);
  current.push.apply(current, values);
  set(el, current);
  return current;
}

function remove (el, input) {
  var current = classes(el);
  var values = interpret(input);
  values.forEach(function (value) {
    var i = current.indexOf(value);
    if (i !== -1) {
      current.splice(i, 1);
    }
  });
  set(el, current);
  return current;
}

function contains (el, input) {
  var current = classes(el);
  var values = interpret(input);

  return values.every(function (value) {
    return current.indexOf(value) !== -1;
  });
}

module.exports = {
  add: add,
  remove: remove,
  contains: contains,
  set: set,
  get: classes
};

},{"./test":17}],12:[function(require,module,exports){
'use strict';

var handlers = {};

function register (name, type, filter) {
  handlers[name] = {
    event: type,
    filter: filter,
    wrap: wrap
  };

  function wrap (fn) {
    return wrapper(name, fn);
  }
}

function wrapper (name, fn) {
  if (!fn) {
    return fn;
  }
  var key = '__dce_' + name;
  if (fn[key]) {
    return fn[key];
  }
  fn[key] = function customEvent (e) {
    var match = handlers[name].filter(e);
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

},{}],13:[function(require,module,exports){
(function (global){
'use strict';

var sektor = require('sektor');
var crossvent = require('crossvent');
var Dominus = require('./Dominus.ctor');
var cast = require('./cast');
var apply = require('./apply');
var text = require('./text');
var test = require('./test');
var api = module.exports = {};
var delegates = {};

function castContext (context) {
  if (typeof context === 'string') {
    return api.qs(null, context);
  }
  if (test.isElement(context)) {
    return context;
  }
  if (context instanceof Dominus) {
    return context[0];
  }
  return null;
}

api.qsa = function (el, selector) {
  var results = new Dominus();
  return sektor(selector, castContext(el), results);
};

api.qs = function (el, selector) {
  return api.qsa(el, selector)[0];
};

api.matches = function (el, selector) {
  return test.isElement(el) && sektor.matchesSelector(el, selector);
};

function relatedFactory (prop) {
  return function related (el, selector) {
    var relative = el[prop];
    if (relative) {
      if (!selector || api.matches(relative, selector)) {
        return cast(relative);
      }
    }
    return new Dominus();
  };
}

api.prev = relatedFactory('previousElementSibling');
api.next = relatedFactory('nextElementSibling');
api.parent = relatedFactory('parentElement');

function matches (el, value) {
  if (!value) {
    return true;
  }
  if (value instanceof Dominus) {
    return value.indexOf(el) !== -1;
  }
  if (test.isElement(value)) {
    return el === value;
  }
  return api.matches(el, value);
}

api.parents = function (el, value) {
  var elements = [];
  var current = el;
  while (current.parentElement) {
    if (matches(current.parentElement, value)) {
      elements.push(current.parentElement);
    }
    current = current.parentElement;
  }
  return apply(elements);
};

api.children = function (el, value) {
  var elements = [];
  var children = el.children;
  var child;
  var i;
  for (i = 0; children && i < children.length; i++) {
    child = children[i];
    if (matches(child, value)) {
      elements.push(child);
    }
  }
  return apply(elements);
};

// this method caches delegates so that .off() works seamlessly
function delegate (root, filter, fn) {
  if (delegates[fn._dd]) {
    return delegates[fn._dd];
  }
  fn._dd = Date.now();
  delegates[fn._dd] = delegator;
  function delegator (e) {
    var el = e.target;
    while (el && el !== root) {
      if (api.matches(el, filter)) {
        fn.apply(this, arguments); return;
      }
      el = el.parentElement;
    }
  }
  return delegator;
}

function evented (method, el, type, filter, fn) {
  if (filter === null) {
    crossvent[method](el, type, fn);
  } else {
    crossvent[method](el, type, delegate(el, filter, fn));
  }
}

function once (el, type, filter, fn) {
  var things = [el, type, filter, disposable];
  api.on.apply(api, things);
  function disposable () {
    api.off.apply(api, things);
    return fn.apply(this, arguments);
  }
}

api.once = once;
api.on = evented.bind(null, 'add');
api.off = evented.bind(null, 'remove');
api.emit = evented.bind(null, 'fabricate');

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

api.value = function (el, value) {
  var checkable = test.isCheckable(el);
  var getter = arguments.length < 2;
  if (getter) {
    return checkable ? el.checked : el.value;
  } else if (checkable) {
    el.checked = value;
  } else {
    el.value = value;
  }
};

api.attr = function (el, name, value) {
  if (!test.isElement(el)) {
    return;
  }
  if (value === null || value === void 0) {
    el.removeAttribute(name); return;
  }
  var camel = text.hyphenToCamel(name);
  if (camel in el) {
    el[camel] = value;
  } else {
    el.setAttribute(name, value);
  }
};

api.getAttr = function (el, name) {
  var camel = text.hyphenToCamel(name);
  if (camel in el) {
    return el[camel];
  } else if (el.getAttribute) {
    return el.getAttribute(name);
  }
  return null;
};

api.manyAttr = function (elem, attrs) {
  Object.keys(attrs).forEach(function (attr) {
    api.attr(elem, attr, attrs[attr]);
  });
};

api.make = function (type) {
  return new Dominus(document.createElement(type));
};

api.clone = function (el) {
  if (el.cloneNode) {
    return el.cloneNode(true);
  }
  return el;
};

api.remove = function (el) {
  if (el.parentElement) {
    el.parentElement.removeChild(el);
  }
};

api.append = function (el, target) {
  if (manipulationGuard(el, target, api.append)) {
    return;
  }
  if (el.appendChild) {
    el.appendChild(target);
  }
};

api.prepend = function (el, target) {
  if (manipulationGuard(el, target, api.prepend)) {
    return;
  }
  if (el.insertBefore) {
    el.insertBefore(target, el.firstChild);
  }
};

api.before = function (el, target) {
  if (manipulationGuard(el, target, api.before)) {
    return;
  }
  if (el.parentElement) {
    el.parentElement.insertBefore(target, el);
  }
};

api.after = function (el, target) {
  if (manipulationGuard(el, target, api.after)) {
    return;
  }
  if (el.parentElement) {
    el.parentElement.insertBefore(target, el.nextSibling);
  }
};

function manipulationGuard (el, target, fn) {
  var right = target instanceof Dominus;
  var left = el instanceof Dominus;
  if (left) {
    el.forEach(manipulateMany);
  } else if (right) {
    manipulate(el, true);
  }
  return !el || !target || left || right;

  function manipulate (el, precondition) {
    if (right) {
      target.forEach(function (target, j) {
        fn(el, cloneUnless(target, precondition && j === 0));
      });
    } else {
      fn(el, cloneUnless(target, precondition));
    }
  }

  function manipulateMany (el, i) {
    manipulate(el, i === 0);
  }
}

function cloneUnless (target, condition) {
  return condition ? target : api.clone(target);
}

['appendTo', 'prependTo', 'beforeOf', 'afterOf'].forEach(flip);

function flip (key) {
  var original = key.split(/[A-Z]/)[0];
  api[key] = function (el, target) {
    api[original](target, el);
  };
}

var numericCssProperties = {
  'column-count': true,
  'fill-opacity': true,
  'flex-grow': true,
  'flex-shrink': true,
  'font-weight': true,
  'line-height': true,
  'opacity': true,
  'order': true,
  'orphans': true,
  'widows': true,
  'z-index': true,
  'zoom': true
};
var numeric = /^\d+$/;
var canFloat = 'float' in document.body.style;

api.getCss = function (el, prop) {
  if (!test.isElement(el)) {
    return null;
  }
  var hprop = text.hyphenate(prop);
  var fprop = !canFloat && hprop === 'float' ? 'cssFloat' : hprop;
  var result = global.getComputedStyle(el)[hprop];
  if (prop === 'opacity' && result === '') {
    return 1;
  }
  if (result.substr(-2) === 'px' || numeric.test(result)) {
    return parseFloat(result, 10);
  }
  return result;
};

api.setCss = function (props) {
  var mapped = Object.keys(props).filter(bad).map(expand);
  function bad (prop) {
    var value = props[prop];
    return value !== null && value === value;
  }
  function expand (prop) {
    var hprop = text.hyphenate(prop);
    var value = props[prop];
    if (typeof value === 'number' && !numericCssProperties[hprop]) {
      value += 'px';
    }
    return {
      name: hprop, value: value
    };
  }
  return function (el) {
    if (!test.isElement(el)) {
      return;
    }
    mapped.forEach(function (prop) {
      el.style[prop.name] = prop.value;
    });
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Dominus.ctor":7,"./apply":9,"./cast":10,"./test":17,"./text":18,"crossvent":1,"sektor":6}],14:[function(require,module,exports){
'use strict';

module.exports = require('./Dominus.prototype');

},{"./Dominus.prototype":8}],15:[function(require,module,exports){
'use strict';

var Dominus = require('./Dominus.ctor');

function flatten (a, cache) {
  return a.reduce(function (current, item) {
    if (Dominus.isArray(item)) {
      return flatten(item, current);
    } else if (current.indexOf(item) === -1) {
      return current.concat(item);
    }
    return current;
  }, cache || new Dominus());
}

module.exports = flatten;

},{"./Dominus.ctor":7}],16:[function(require,module,exports){
'use strict';

var dom = require('./dom');
var cast = require('./cast');
var custom = require('./custom');
var Dominus = require('./Dominus.ctor');
var tag = /^\s*<([a-z]+(?:-[a-z]+)?)\s*\/?>\s*$/i;

function api (selector, context) {
  var notText = typeof selector !== 'string';
  if (notText && arguments.length < 2) {
    return cast(selector);
  }
  if (notText) {
    return new Dominus();
  }
  var matches = selector.match(tag);
  if (matches) {
    return dom.make(matches[1]);
  }
  return api.find(selector, context);
}

api.find = function (selector, context) {
  return dom.qsa(context, selector);
};

api.findOne = function (selector, context) {
  return dom.qs(context, selector);
};

api.custom = custom.register;

module.exports = api;

},{"./Dominus.ctor":7,"./cast":10,"./custom":12,"./dom":13}],17:[function(require,module,exports){
'use strict';

var elementObjects = typeof HTMLElement === 'object';

function isElement (o) {
  return elementObjects ? o instanceof HTMLElement : isElementObject(o);
}

function isElementObject (o) {
  return o &&
    typeof o === 'object' &&
    typeof o.nodeName === 'string' &&
    o.nodeType === 1;
}

function isArray (a) {
  return Object.prototype.toString.call(a) === '[object Array]';
}

function isCheckable (elem) {
  return 'checked' in elem && elem.type === 'radio' || elem.type === 'checkbox';
}

module.exports = {
  isElement: isElement,
  isArray: isArray,
  isCheckable: isCheckable
};

},{}],18:[function(require,module,exports){
'use strict';

function hyphenToCamel (hyphens) {
  var part = /-([a-z])/g;
  return hyphens.replace(part, function (g, m) {
    return m.toUpperCase();
  });
}

function hyphenate (text) {
  var camel = /([a-z])([A-Z])/g;
  return text.replace(camel, '$1-$2').toLowerCase();
}

module.exports = {
  hyphenToCamel: hyphenToCamel,
  hyphenate: hyphenate
};

},{}]},{},[14])(14)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9jcm9zc3ZlbnQuanMiLCJub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9ldmVudG1hcC5qcyIsIm5vZGVfbW9kdWxlcy9jdXN0b20tZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcG9zZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcG9zZXIvc3JjL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2VrdG9yL3NyYy9zZWt0b3IuanMiLCJzcmMvRG9taW51cy5jdG9yLmpzIiwic3JjL0RvbWludXMucHJvdG90eXBlLmpzIiwic3JjL2FwcGx5LmpzIiwic3JjL2Nhc3QuanMiLCJzcmMvY2xhc3Nlcy5qcyIsInNyYy9jdXN0b20uanMiLCJzcmMvZG9tLmpzIiwic3JjL2RvbWludXMuanMiLCJzcmMvZmxhdHRlbi5qcyIsInNyYy9wdWJsaWMuanMiLCJzcmMvdGVzdC5qcyIsInNyYy90ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzVkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3VzdG9tRXZlbnQgPSByZXF1aXJlKCdjdXN0b20tZXZlbnQnKTtcbnZhciBldmVudG1hcCA9IHJlcXVpcmUoJy4vZXZlbnRtYXAnKTtcbnZhciBkb2MgPSBnbG9iYWwuZG9jdW1lbnQ7XG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XG52YXIgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEVhc3k7XG52YXIgaGFyZENhY2hlID0gW107XG5cbmlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgYWRkRXZlbnQgPSBhZGRFdmVudEhhcmQ7XG4gIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRIYXJkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudCxcbiAgZmFicmljYXRlOiBmYWJyaWNhdGVFdmVudFxufTtcblxuZnVuY3Rpb24gYWRkRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCB3cmFwKGVsLCB0eXBlLCBmbikpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgbGlzdGVuZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKTtcbiAgaWYgKGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmFicmljYXRlRXZlbnQgKGVsLCB0eXBlLCBtb2RlbCkge1xuICB2YXIgZSA9IGV2ZW50bWFwLmluZGV4T2YodHlwZSkgPT09IC0xID8gbWFrZUN1c3RvbUV2ZW50KCkgOiBtYWtlQ2xhc3NpY0V2ZW50KCk7XG4gIGlmIChlbC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5maXJlRXZlbnQoJ29uJyArIHR5cGUsIGUpO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDbGFzc2ljRXZlbnQgKCkge1xuICAgIHZhciBlO1xuICAgIGlmIChkb2MuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGRvYy5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgIH1cbiAgICByZXR1cm4gZTtcbiAgfVxuICBmdW5jdGlvbiBtYWtlQ3VzdG9tRXZlbnQgKCkge1xuICAgIHJldHVybiBuZXcgY3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IG1vZGVsIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZXJGYWN0b3J5IChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIgKG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IG9yaWdpbmFsRXZlbnQgfHwgZ2xvYmFsLmV2ZW50O1xuICAgIGUudGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGUucHJldmVudERlZmF1bHQgPSBlLnByZXZlbnREZWZhdWx0IHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICgpIHsgZS5jYW5jZWxCdWJibGUgPSB0cnVlOyB9O1xuICAgIGUud2hpY2ggPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBmbi5jYWxsKGVsLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciB3cmFwcGVyID0gdW53cmFwKGVsLCB0eXBlLCBmbikgfHwgd3JhcHBlckZhY3RvcnkoZWwsIHR5cGUsIGZuKTtcbiAgaGFyZENhY2hlLnB1c2goe1xuICAgIHdyYXBwZXI6IHdyYXBwZXIsXG4gICAgZWxlbWVudDogZWwsXG4gICAgdHlwZTogdHlwZSxcbiAgICBmbjogZm5cbiAgfSk7XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiB1bndyYXAgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgaSA9IGZpbmQoZWwsIHR5cGUsIGZuKTtcbiAgaWYgKGkpIHtcbiAgICB2YXIgd3JhcHBlciA9IGhhcmRDYWNoZVtpXS53cmFwcGVyO1xuICAgIGhhcmRDYWNoZS5zcGxpY2UoaSwgMSk7IC8vIGZyZWUgdXAgYSB0YWQgb2YgbWVtb3J5XG4gICAgcmV0dXJuIHdyYXBwZXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpLCBpdGVtO1xuICBmb3IgKGkgPSAwOyBpIDwgaGFyZENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgaXRlbSA9IGhhcmRDYWNoZVtpXTtcbiAgICBpZiAoaXRlbS5lbGVtZW50ID09PSBlbCAmJiBpdGVtLnR5cGUgPT09IHR5cGUgJiYgaXRlbS5mbiA9PT0gZm4pIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRtYXAgPSBbXTtcbnZhciBldmVudG5hbWUgPSAnJztcbnZhciByb24gPSAvXm9uLztcblxuZm9yIChldmVudG5hbWUgaW4gZ2xvYmFsKSB7XG4gIGlmIChyb24udGVzdChldmVudG5hbWUpKSB7XG4gICAgZXZlbnRtYXAucHVzaChldmVudG5hbWUuc2xpY2UoMikpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXZlbnRtYXA7XG4iLCJcbnZhciBOYXRpdmVDdXN0b21FdmVudCA9IGdsb2JhbC5DdXN0b21FdmVudDtcblxuZnVuY3Rpb24gdXNlTmF0aXZlICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgcCA9IG5ldyBOYXRpdmVDdXN0b21FdmVudCgnY2F0JywgeyBkZXRhaWw6IHsgZm9vOiAnYmFyJyB9IH0pO1xuICAgIHJldHVybiAgJ2NhdCcgPT09IHAudHlwZSAmJiAnYmFyJyA9PT0gcC5kZXRhaWwuZm9vO1xuICB9IGNhdGNoIChlKSB7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENyb3NzLWJyb3dzZXIgYEN1c3RvbUV2ZW50YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQuQ3VzdG9tRXZlbnRcbiAqXG4gKiBAcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB1c2VOYXRpdmUoKSA/IE5hdGl2ZUN1c3RvbUV2ZW50IDpcblxuLy8gSUUgPj0gOVxuJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID8gZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgfSBlbHNlIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XG4gIH1cbiAgcmV0dXJuIGU7XG59IDpcblxuLy8gSUUgPD0gOFxuZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gIGUudHlwZSA9IHR5cGU7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmJ1YmJsZXMgPSBCb29sZWFuKHBhcmFtcy5idWJibGVzKTtcbiAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcbiAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gIH0gZWxzZSB7XG4gICAgZS5idWJibGVzID0gZmFsc2U7XG4gICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgZS5kZXRhaWwgPSB2b2lkIDA7XG4gIH1cbiAgcmV0dXJuIGU7XG59XG4iLCJ2YXIgcG9zZXIgPSByZXF1aXJlKCcuL3NyYy9ub2RlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zZXI7XG5cblsnQXJyYXknLCAnRnVuY3Rpb24nLCAnT2JqZWN0JywgJ0RhdGUnLCAnU3RyaW5nJ10uZm9yRWFjaChwb3NlKTtcblxuZnVuY3Rpb24gcG9zZSAodHlwZSkge1xuICBwb3Nlclt0eXBlXSA9IGZ1bmN0aW9uIHBvc2VDb21wdXRlZFR5cGUgKCkgeyByZXR1cm4gcG9zZXIodHlwZSk7IH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkID0gZ2xvYmFsLmRvY3VtZW50O1xuXG5mdW5jdGlvbiBwb3NlciAodHlwZSkge1xuICB2YXIgaWZyYW1lID0gZC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cbiAgcmV0dXJuIG1hcCh0eXBlLCBpZnJhbWUuY29udGVudFdpbmRvdyk7XG59XG5cbmZ1bmN0aW9uIG1hcCAodHlwZSwgc291cmNlKSB7IC8vIGZvcndhcmQgcG9seWZpbGxzIHRvIHRoZSBzdG9sZW4gcmVmZXJlbmNlIVxuICB2YXIgb3JpZ2luYWwgPSB3aW5kb3dbdHlwZV0ucHJvdG90eXBlO1xuICB2YXIgdmFsdWUgPSBzb3VyY2VbdHlwZV07XG4gIHZhciBwcm9wO1xuXG4gIGZvciAocHJvcCBpbiBvcmlnaW5hbCkge1xuICAgIHZhbHVlLnByb3RvdHlwZVtwcm9wXSA9IG9yaWdpbmFsW3Byb3BdO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXhwYW5kbyA9ICdzZWt0b3ItJyArIERhdGUubm93KCk7XG52YXIgcnNpYmxpbmdzID0gL1srfl0vO1xudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIGRlbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCB7fTtcbnZhciBtYXRjaCA9IChcbiAgZGVsLm1hdGNoZXMgfHxcbiAgZGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICBkZWwubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gIGRlbC5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gIGRlbC5tc01hdGNoZXNTZWxlY3RvciB8fFxuICBuZXZlclxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZWt0b3I7XG5cbnNla3Rvci5tYXRjaGVzID0gbWF0Y2hlcztcbnNla3Rvci5tYXRjaGVzU2VsZWN0b3IgPSBtYXRjaGVzU2VsZWN0b3I7XG5cbmZ1bmN0aW9uIHFzYSAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIGV4aXN0ZWQsIGlkLCBwcmVmaXgsIHByZWZpeGVkLCBhZGFwdGVyLCBoYWNrID0gY29udGV4dCAhPT0gZG9jdW1lbnQ7XG4gIGlmIChoYWNrKSB7IC8vIGlkIGhhY2sgZm9yIGNvbnRleHQtcm9vdGVkIHF1ZXJpZXNcbiAgICBleGlzdGVkID0gY29udGV4dC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgaWQgPSBleGlzdGVkIHx8IGV4cGFuZG87XG4gICAgcHJlZml4ID0gJyMnICsgaWQgKyAnICc7XG4gICAgcHJlZml4ZWQgPSBwcmVmaXggKyBzZWxlY3Rvci5yZXBsYWNlKC8sL2csICcsJyArIHByZWZpeCk7XG4gICAgYWRhcHRlciA9IHJzaWJsaW5ncy50ZXN0KHNlbGVjdG9yKSAmJiBjb250ZXh0LnBhcmVudE5vZGU7XG4gICAgaWYgKCFleGlzdGVkKSB7IGNvbnRleHQuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTsgfVxuICB9XG4gIHRyeSB7XG4gICAgcmV0dXJuIChhZGFwdGVyIHx8IGNvbnRleHQpLnF1ZXJ5U2VsZWN0b3JBbGwocHJlZml4ZWQgfHwgc2VsZWN0b3IpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9IGZpbmFsbHkge1xuICAgIGlmIChleGlzdGVkID09PSBudWxsKSB7IGNvbnRleHQucmVtb3ZlQXR0cmlidXRlKCdpZCcpOyB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VrdG9yIChzZWxlY3RvciwgY3R4LCBjb2xsZWN0aW9uLCBzZWVkKSB7XG4gIHZhciBlbGVtZW50O1xuICB2YXIgY29udGV4dCA9IGN0eCB8fCBkb2N1bWVudDtcbiAgdmFyIHJlc3VsdHMgPSBjb2xsZWN0aW9uIHx8IFtdO1xuICB2YXIgaSA9IDA7XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbiAgaWYgKGNvbnRleHQubm9kZVR5cGUgIT09IDEgJiYgY29udGV4dC5ub2RlVHlwZSAhPT0gOSkge1xuICAgIHJldHVybiBbXTsgLy8gYmFpbCBpZiBjb250ZXh0IGlzIG5vdCBhbiBlbGVtZW50IG9yIGRvY3VtZW50XG4gIH1cbiAgaWYgKHNlZWQpIHtcbiAgICB3aGlsZSAoKGVsZW1lbnQgPSBzZWVkW2krK10pKSB7XG4gICAgICBpZiAobWF0Y2hlc1NlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJlc3VsdHMucHVzaC5hcHBseShyZXN1bHRzLCBxc2Eoc2VsZWN0b3IsIGNvbnRleHQpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZnVuY3Rpb24gbWF0Y2hlcyAoc2VsZWN0b3IsIGVsZW1lbnRzKSB7XG4gIHJldHVybiBzZWt0b3Ioc2VsZWN0b3IsIG51bGwsIG51bGwsIGVsZW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yIChlbGVtZW50LCBzZWxlY3Rvcikge1xuICByZXR1cm4gbWF0Y2guY2FsbChlbGVtZW50LCBzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIG5ldmVyICgpIHsgcmV0dXJuIGZhbHNlOyB9XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwb3NlciA9IHJlcXVpcmUoJ3Bvc2VyJyk7XG52YXIgRG9taW51cyA9IHBvc2VyLkFycmF5KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRG9taW51cztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyICQgPSByZXF1aXJlKCcuL3B1YmxpYycpO1xudmFyIGZsYXR0ZW4gPSByZXF1aXJlKCcuL2ZsYXR0ZW4nKTtcbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbScpO1xudmFyIGN1c3RvbSA9IHJlcXVpcmUoJy4vY3VzdG9tJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xuXG5mdW5jdGlvbiBlcXVhbHMgKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlcXVhbHMgKGVsZW0pIHtcbiAgICByZXR1cm4gZG9tLm1hdGNoZXMoZWxlbSwgc2VsZWN0b3IpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHJhaWdodCAocHJvcCwgb25lKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkb21NYXBwaW5nIChzZWxlY3Rvcikge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLm1hcChmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgcmV0dXJuIGRvbVtwcm9wXShlbGVtLCBzZWxlY3Rvcik7XG4gICAgfSk7XG4gICAgdmFyIHJlc3VsdHMgPSBmbGF0dGVuKHJlc3VsdCk7XG4gICAgcmV0dXJuIG9uZSA/IHJlc3VsdHNbMF0gOiByZXN1bHRzO1xuICB9O1xufVxuXG5Eb21pbnVzLnByb3RvdHlwZS5wcmV2ID0gc3RyYWlnaHQoJ3ByZXYnKTtcbkRvbWludXMucHJvdG90eXBlLm5leHQgPSBzdHJhaWdodCgnbmV4dCcpO1xuRG9taW51cy5wcm90b3R5cGUucGFyZW50ID0gc3RyYWlnaHQoJ3BhcmVudCcpO1xuRG9taW51cy5wcm90b3R5cGUucGFyZW50cyA9IHN0cmFpZ2h0KCdwYXJlbnRzJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5jaGlsZHJlbiA9IHN0cmFpZ2h0KCdjaGlsZHJlbicpO1xuRG9taW51cy5wcm90b3R5cGUuZmluZCA9IHN0cmFpZ2h0KCdxc2EnKTtcbkRvbWludXMucHJvdG90eXBlLmZpbmRPbmUgPSBzdHJhaWdodCgncXMnLCB0cnVlKTtcblxuRG9taW51cy5wcm90b3R5cGUud2hlcmUgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHRoaXMuZmlsdGVyKGVxdWFscyhzZWxlY3RvcikpO1xufTtcblxuRG9taW51cy5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHRoaXMuc29tZShlcXVhbHMoc2VsZWN0b3IpKTtcbn07XG5cbkRvbWludXMucHJvdG90eXBlLmkgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgcmV0dXJuIHRoaXNbaW5kZXhdID8gbmV3IERvbWludXModGhpc1tpbmRleF0pIDogbmV3IERvbWludXMoKTtcbn07XG5cbmZ1bmN0aW9uIGNvbXBhcmVGYWN0b3J5IChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gY29tcGFyZSAoKSB7XG4gICAgJC5hcHBseShudWxsLCBhcmd1bWVudHMpLmZvckVhY2goZm4sIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5Eb21pbnVzLnByb3RvdHlwZS5hbmQgPSBjb21wYXJlRmFjdG9yeShmdW5jdGlvbiBhZGRPbmUgKGVsZW0pIHtcbiAgaWYgKHRoaXMuaW5kZXhPZihlbGVtKSA9PT0gLTEpIHtcbiAgICB0aGlzLnB1c2goZWxlbSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59KTtcblxuRG9taW51cy5wcm90b3R5cGUuYnV0ID0gY29tcGFyZUZhY3RvcnkoZnVuY3Rpb24gYWRkT25lIChlbGVtKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuaW5kZXhPZihlbGVtKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn0pO1xuXG5Eb21pbnVzLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgdmFyIHByb3BzO1xuICB2YXIgbWFueSA9IG5hbWUgJiYgdHlwZW9mIG5hbWUgPT09ICdvYmplY3QnO1xuICB2YXIgZ2V0dGVyID0gIW1hbnkgJiYgIXZhbHVlO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID8gZG9tLmdldENzcyh0aGlzWzBdLCBuYW1lKSA6IG51bGw7XG4gIH1cbiAgaWYgKG1hbnkpIHtcbiAgICBwcm9wcyA9IG5hbWU7XG4gIH0gZWxzZSB7XG4gICAgcHJvcHMgPSB7fTtcbiAgICBwcm9wc1tuYW1lXSA9IHZhbHVlO1xuICB9XG4gIHRoaXMuZm9yRWFjaChkb20uc2V0Q3NzKHByb3BzKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gZXZlbnRlciAobWV0aG9kKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodHlwZXMsIGZpbHRlciwgZm4pIHtcbiAgICB2YXIgdHlwZWxpc3QgPSB0eXBlcy5zcGxpdCgnICcpO1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuID0gZmlsdGVyO1xuICAgICAgZmlsdGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICB0eXBlbGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gY3VzdG9tLmhhbmRsZXJzW3R5cGVdO1xuICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgIGRvbVttZXRob2RdKGVsZW0sIGhhbmRsZXIuZXZlbnQsIGZpbHRlciwgaGFuZGxlci53cmFwKGZuKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9tW21ldGhvZF0oZWxlbSwgdHlwZSwgZmlsdGVyLCBmbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5Eb21pbnVzLnByb3RvdHlwZS5vbmNlID0gZXZlbnRlcignb25jZScpO1xuRG9taW51cy5wcm90b3R5cGUub24gPSBldmVudGVyKCdvbicpO1xuRG9taW51cy5wcm90b3R5cGUub2ZmID0gZXZlbnRlcignb2ZmJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5lbWl0ID0gZXZlbnRlcignZW1pdCcpO1xuXG5bXG4gIFsnYWRkQ2xhc3MnLCBjbGFzc2VzLmFkZF0sXG4gIFsncmVtb3ZlQ2xhc3MnLCBjbGFzc2VzLnJlbW92ZV0sXG4gIFsnc2V0Q2xhc3MnLCBjbGFzc2VzLnNldF0sXG4gIFsncmVtb3ZlQ2xhc3MnLCBjbGFzc2VzLnJlbW92ZV0sXG4gIFsncmVtb3ZlJywgZG9tLnJlbW92ZV1cbl0uZm9yRWFjaChtYXBNZXRob2RzKTtcblxuZnVuY3Rpb24gbWFwTWV0aG9kcyAoZGF0YSkge1xuICBEb21pbnVzLnByb3RvdHlwZVtkYXRhWzBdXSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgZGF0YVsxXShlbGVtLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbltcbiAgJ2FwcGVuZCcsXG4gICdhcHBlbmRUbycsXG4gICdwcmVwZW5kJyxcbiAgJ3ByZXBlbmRUbycsXG4gICdiZWZvcmUnLFxuICAnYmVmb3JlT2YnLFxuICAnYWZ0ZXInLFxuICAnYWZ0ZXJPZidcbl0uZm9yRWFjaChtYXBNYW5pcHVsYXRpb24pO1xuXG5mdW5jdGlvbiBtYXBNYW5pcHVsYXRpb24gKG1ldGhvZCkge1xuICBEb21pbnVzLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgZG9tW21ldGhvZF0odGhpcywgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5Eb21pbnVzLnByb3RvdHlwZS5oYXNDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5zb21lKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMuY29udGFpbnMoZWxlbSwgdmFsdWUpO1xuICB9KTtcbn07XG5cbkRvbWludXMucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgdmFyIGhhc2ggPSBuYW1lICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JztcbiAgdmFyIHNldCA9IGhhc2ggPyBzZXRNYW55IDogc2V0U2luZ2xlO1xuICB2YXIgc2V0dGVyID0gaGFzaCB8fCBhcmd1bWVudHMubGVuZ3RoID4gMTtcbiAgaWYgKHNldHRlcikge1xuICAgIHRoaXMuZm9yRWFjaChzZXQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA/IGRvbS5nZXRBdHRyKHRoaXNbMF0sIG5hbWUpIDogbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBzZXRNYW55IChlbGVtKSB7XG4gICAgZG9tLm1hbnlBdHRyKGVsZW0sIG5hbWUpO1xuICB9XG4gIGZ1bmN0aW9uIHNldFNpbmdsZSAoZWxlbSkge1xuICAgIGRvbS5hdHRyKGVsZW0sIG5hbWUsIHZhbHVlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24ga2V5VmFsdWUgKGtleSwgdmFsdWUpIHtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID8gZG9tW2tleV0odGhpc1swXSkgOiAnJztcbiAgfVxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICBkb21ba2V5XShlbGVtLCB2YWx1ZSk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24ga2V5VmFsdWVQcm9wZXJ0eSAocHJvcCkge1xuICBEb21pbnVzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uIGFjY2Vzc29yICh2YWx1ZSkge1xuICAgIHZhciBnZXR0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMTtcbiAgICBpZiAoZ2V0dGVyKSB7XG4gICAgICByZXR1cm4ga2V5VmFsdWUuY2FsbCh0aGlzLCBwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleVZhbHVlLmNhbGwodGhpcywgcHJvcCwgdmFsdWUpO1xuICB9O1xufVxuXG5bJ2h0bWwnLCAndGV4dCcsICd2YWx1ZSddLmZvckVhY2goa2V5VmFsdWVQcm9wZXJ0eSk7XG5cbkRvbWludXMucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICByZXR1cm4gZG9tLmNsb25lKGVsZW0pO1xuICB9KTtcbn07XG5cbkRvbWludXMucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICB0aGlzWzBdLmZvY3VzKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vcHVibGljJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBEb21pbnVzID0gcmVxdWlyZSgnLi9Eb21pbnVzLmN0b3InKTtcbnZhciBwcm90byA9IERvbWludXMucHJvdG90eXBlO1xuXG5mdW5jdGlvbiBBcHBsaWVkIChhcmdzKSB7XG4gIHJldHVybiBEb21pbnVzLmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxuXG5BcHBsaWVkLnByb3RvdHlwZSA9IHByb3RvO1xuXG5mdW5jdGlvbiBhcHBseSAoYSkge1xuICByZXR1cm4gbmV3IEFwcGxpZWQoYSk7XG59XG5cblsnbWFwJywgJ2ZpbHRlcicsICdjb25jYXQnLCAnc2xpY2UnXS5mb3JFYWNoKGVuc3VyZSk7XG5cbmZ1bmN0aW9uIGVuc3VyZSAoa2V5KSB7XG4gIHZhciBvcmlnaW5hbCA9IHByb3RvW2tleV07XG4gIHByb3RvW2tleV0gPSBmdW5jdGlvbiBhcHBsaWVkICgpIHtcbiAgICByZXR1cm4gYXBwbHkob3JpZ2luYWwuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG52YXIgYXBwbHkgPSByZXF1aXJlKCcuL2FwcGx5Jyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG5cbmZ1bmN0aW9uIGNhc3QgKGEpIHtcbiAgaWYgKGEgPT09IGdsb2JhbCkge1xuICAgIHJldHVybiBuZXcgRG9taW51cyhhKTtcbiAgfVxuICBpZiAoYSBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gYTtcbiAgfVxuICBpZiAoIWEpIHtcbiAgICByZXR1cm4gbmV3IERvbWludXMoKTtcbiAgfVxuICBpZiAodGVzdC5pc0VsZW1lbnQoYSkpIHtcbiAgICByZXR1cm4gbmV3IERvbWludXMoYSk7XG4gIH1cbiAgaWYgKCF0ZXN0LmlzQXJyYXkoYSkpIHtcbiAgICByZXR1cm4gbmV3IERvbWludXMoKTtcbiAgfVxuICByZXR1cm4gYXBwbHkoYSkuZmlsdGVyKGZ1bmN0aW9uIChpKSB7XG4gICAgcmV0dXJuIHRlc3QuaXNFbGVtZW50KGkpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xudmFyIHdoaXRlc3BhY2UgPSAvXFxzKy9nO1xudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcblxuZnVuY3Rpb24gaW50ZXJwcmV0IChpbnB1dCkge1xuICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/IGlucHV0LnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpIDogaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZXMgKGVsKSB7XG4gIGlmICh0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm4gZWwuY2xhc3NOYW1lLnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gc2V0IChlbCwgaW5wdXQpIHtcbiAgaWYgKHRlc3QuaXNFbGVtZW50KGVsKSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IGludGVycHJldChpbnB1dCkuam9pbignICcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZCAoZWwsIGlucHV0KSB7XG4gIHZhciBjdXJyZW50ID0gcmVtb3ZlKGVsLCBpbnB1dCk7XG4gIHZhciB2YWx1ZXMgPSBpbnRlcnByZXQoaW5wdXQpO1xuICBjdXJyZW50LnB1c2guYXBwbHkoY3VycmVudCwgdmFsdWVzKTtcbiAgc2V0KGVsLCBjdXJyZW50KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoZWwsIGlucHV0KSB7XG4gIHZhciBjdXJyZW50ID0gY2xhc3NlcyhlbCk7XG4gIHZhciB2YWx1ZXMgPSBpbnRlcnByZXQoaW5wdXQpO1xuICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgaSA9IGN1cnJlbnQuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICBjdXJyZW50LnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH0pO1xuICBzZXQoZWwsIGN1cnJlbnQpO1xuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gY29udGFpbnMgKGVsLCBpbnB1dCkge1xuICB2YXIgY3VycmVudCA9IGNsYXNzZXMoZWwpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcblxuICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBjdXJyZW50LmluZGV4T2YodmFsdWUpICE9PSAtMTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZCxcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIGNvbnRhaW5zOiBjb250YWlucyxcbiAgc2V0OiBzZXQsXG4gIGdldDogY2xhc3Nlc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhbmRsZXJzID0ge307XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyIChuYW1lLCB0eXBlLCBmaWx0ZXIpIHtcbiAgaGFuZGxlcnNbbmFtZV0gPSB7XG4gICAgZXZlbnQ6IHR5cGUsXG4gICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgd3JhcDogd3JhcFxuICB9O1xuXG4gIGZ1bmN0aW9uIHdyYXAgKGZuKSB7XG4gICAgcmV0dXJuIHdyYXBwZXIobmFtZSwgZm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZXIgKG5hbWUsIGZuKSB7XG4gIGlmICghZm4pIHtcbiAgICByZXR1cm4gZm47XG4gIH1cbiAgdmFyIGtleSA9ICdfX2RjZV8nICsgbmFtZTtcbiAgaWYgKGZuW2tleV0pIHtcbiAgICByZXR1cm4gZm5ba2V5XTtcbiAgfVxuICBmbltrZXldID0gZnVuY3Rpb24gY3VzdG9tRXZlbnQgKGUpIHtcbiAgICB2YXIgbWF0Y2ggPSBoYW5kbGVyc1tuYW1lXS5maWx0ZXIoZSk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmbltrZXldO1xufVxuXG5yZWdpc3RlcignbGVmdC1jbGljaycsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIHJldHVybiBlLndoaWNoID09PSAxICYmICFlLm1ldGFLZXkgJiYgIWUuY3RybEtleTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICB3cmFwcGVyOiB3cmFwcGVyLFxuICBoYW5kbGVyczogaGFuZGxlcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzZWt0b3IgPSByZXF1aXJlKCdzZWt0b3InKTtcbnZhciBjcm9zc3ZlbnQgPSByZXF1aXJlKCdjcm9zc3ZlbnQnKTtcbnZhciBEb21pbnVzID0gcmVxdWlyZSgnLi9Eb21pbnVzLmN0b3InKTtcbnZhciBjYXN0ID0gcmVxdWlyZSgnLi9jYXN0Jyk7XG52YXIgYXBwbHkgPSByZXF1aXJlKCcuL2FwcGx5Jyk7XG52YXIgdGV4dCA9IHJlcXVpcmUoJy4vdGV4dCcpO1xudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcbnZhciBhcGkgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIGRlbGVnYXRlcyA9IHt9O1xuXG5mdW5jdGlvbiBjYXN0Q29udGV4dCAoY29udGV4dCkge1xuICBpZiAodHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGFwaS5xcyhudWxsLCBjb250ZXh0KTtcbiAgfVxuICBpZiAodGVzdC5pc0VsZW1lbnQoY29udGV4dCkpIHtcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gY29udGV4dFswXTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuYXBpLnFzYSA9IGZ1bmN0aW9uIChlbCwgc2VsZWN0b3IpIHtcbiAgdmFyIHJlc3VsdHMgPSBuZXcgRG9taW51cygpO1xuICByZXR1cm4gc2VrdG9yKHNlbGVjdG9yLCBjYXN0Q29udGV4dChlbCksIHJlc3VsdHMpO1xufTtcblxuYXBpLnFzID0gZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xuICByZXR1cm4gYXBpLnFzYShlbCwgc2VsZWN0b3IpWzBdO1xufTtcblxuYXBpLm1hdGNoZXMgPSBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XG4gIHJldHVybiB0ZXN0LmlzRWxlbWVudChlbCkgJiYgc2VrdG9yLm1hdGNoZXNTZWxlY3RvcihlbCwgc2VsZWN0b3IpO1xufTtcblxuZnVuY3Rpb24gcmVsYXRlZEZhY3RvcnkgKHByb3ApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlbGF0ZWQgKGVsLCBzZWxlY3Rvcikge1xuICAgIHZhciByZWxhdGl2ZSA9IGVsW3Byb3BdO1xuICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgaWYgKCFzZWxlY3RvciB8fCBhcGkubWF0Y2hlcyhyZWxhdGl2ZSwgc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBjYXN0KHJlbGF0aXZlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH07XG59XG5cbmFwaS5wcmV2ID0gcmVsYXRlZEZhY3RvcnkoJ3ByZXZpb3VzRWxlbWVudFNpYmxpbmcnKTtcbmFwaS5uZXh0ID0gcmVsYXRlZEZhY3RvcnkoJ25leHRFbGVtZW50U2libGluZycpO1xuYXBpLnBhcmVudCA9IHJlbGF0ZWRGYWN0b3J5KCdwYXJlbnRFbGVtZW50Jyk7XG5cbmZ1bmN0aW9uIG1hdGNoZXMgKGVsLCB2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRG9taW51cykge1xuICAgIHJldHVybiB2YWx1ZS5pbmRleE9mKGVsKSAhPT0gLTE7XG4gIH1cbiAgaWYgKHRlc3QuaXNFbGVtZW50KHZhbHVlKSkge1xuICAgIHJldHVybiBlbCA9PT0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGFwaS5tYXRjaGVzKGVsLCB2YWx1ZSk7XG59XG5cbmFwaS5wYXJlbnRzID0gZnVuY3Rpb24gKGVsLCB2YWx1ZSkge1xuICB2YXIgZWxlbWVudHMgPSBbXTtcbiAgdmFyIGN1cnJlbnQgPSBlbDtcbiAgd2hpbGUgKGN1cnJlbnQucGFyZW50RWxlbWVudCkge1xuICAgIGlmIChtYXRjaGVzKGN1cnJlbnQucGFyZW50RWxlbWVudCwgdmFsdWUpKSB7XG4gICAgICBlbGVtZW50cy5wdXNoKGN1cnJlbnQucGFyZW50RWxlbWVudCk7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGFwcGx5KGVsZW1lbnRzKTtcbn07XG5cbmFwaS5jaGlsZHJlbiA9IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcbiAgdmFyIGVsZW1lbnRzID0gW107XG4gIHZhciBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuO1xuICB2YXIgY2hpbGQ7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBjaGlsZHJlbiAmJiBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIGlmIChtYXRjaGVzKGNoaWxkLCB2YWx1ZSkpIHtcbiAgICAgIGVsZW1lbnRzLnB1c2goY2hpbGQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXBwbHkoZWxlbWVudHMpO1xufTtcblxuLy8gdGhpcyBtZXRob2QgY2FjaGVzIGRlbGVnYXRlcyBzbyB0aGF0IC5vZmYoKSB3b3JrcyBzZWFtbGVzc2x5XG5mdW5jdGlvbiBkZWxlZ2F0ZSAocm9vdCwgZmlsdGVyLCBmbikge1xuICBpZiAoZGVsZWdhdGVzW2ZuLl9kZF0pIHtcbiAgICByZXR1cm4gZGVsZWdhdGVzW2ZuLl9kZF07XG4gIH1cbiAgZm4uX2RkID0gRGF0ZS5ub3coKTtcbiAgZGVsZWdhdGVzW2ZuLl9kZF0gPSBkZWxlZ2F0b3I7XG4gIGZ1bmN0aW9uIGRlbGVnYXRvciAoZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiBlbCAhPT0gcm9vdCkge1xuICAgICAgaWYgKGFwaS5tYXRjaGVzKGVsLCBmaWx0ZXIpKSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlbGVnYXRvcjtcbn1cblxuZnVuY3Rpb24gZXZlbnRlZCAobWV0aG9kLCBlbCwgdHlwZSwgZmlsdGVyLCBmbikge1xuICBpZiAoZmlsdGVyID09PSBudWxsKSB7XG4gICAgY3Jvc3N2ZW50W21ldGhvZF0oZWwsIHR5cGUsIGZuKTtcbiAgfSBlbHNlIHtcbiAgICBjcm9zc3ZlbnRbbWV0aG9kXShlbCwgdHlwZSwgZGVsZWdhdGUoZWwsIGZpbHRlciwgZm4pKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbmNlIChlbCwgdHlwZSwgZmlsdGVyLCBmbikge1xuICB2YXIgdGhpbmdzID0gW2VsLCB0eXBlLCBmaWx0ZXIsIGRpc3Bvc2FibGVdO1xuICBhcGkub24uYXBwbHkoYXBpLCB0aGluZ3MpO1xuICBmdW5jdGlvbiBkaXNwb3NhYmxlICgpIHtcbiAgICBhcGkub2ZmLmFwcGx5KGFwaSwgdGhpbmdzKTtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5hcGkub25jZSA9IG9uY2U7XG5hcGkub24gPSBldmVudGVkLmJpbmQobnVsbCwgJ2FkZCcpO1xuYXBpLm9mZiA9IGV2ZW50ZWQuYmluZChudWxsLCAncmVtb3ZlJyk7XG5hcGkuZW1pdCA9IGV2ZW50ZWQuYmluZChudWxsLCAnZmFicmljYXRlJyk7XG5cbmFwaS5odG1sID0gZnVuY3Rpb24gKGVsZW0sIGh0bWwpIHtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGVsZW0uaW5uZXJIVE1MO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJIVE1MID0gaHRtbDtcbiAgfVxufTtcblxuYXBpLnRleHQgPSBmdW5jdGlvbiAoZWxlbSwgdGV4dCkge1xuICB2YXIgY2hlY2thYmxlID0gdGVzdC5pc0NoZWNrYWJsZShlbGVtKTtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGNoZWNrYWJsZSA/IGVsZW0udmFsdWUgOiBlbGVtLmlubmVyVGV4dCB8fCBlbGVtLnRleHRDb250ZW50O1xuICB9IGVsc2UgaWYgKGNoZWNrYWJsZSkge1xuICAgIGVsZW0udmFsdWUgPSB0ZXh0O1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJUZXh0ID0gZWxlbS50ZXh0Q29udGVudCA9IHRleHQ7XG4gIH1cbn07XG5cbmFwaS52YWx1ZSA9IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcbiAgdmFyIGNoZWNrYWJsZSA9IHRlc3QuaXNDaGVja2FibGUoZWwpO1xuICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDI7XG4gIGlmIChnZXR0ZXIpIHtcbiAgICByZXR1cm4gY2hlY2thYmxlID8gZWwuY2hlY2tlZCA6IGVsLnZhbHVlO1xuICB9IGVsc2UgaWYgKGNoZWNrYWJsZSkge1xuICAgIGVsLmNoZWNrZWQgPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBlbC52YWx1ZSA9IHZhbHVlO1xuICB9XG59O1xuXG5hcGkuYXR0ciA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgaWYgKCF0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IHJldHVybjtcbiAgfVxuICB2YXIgY2FtZWwgPSB0ZXh0Lmh5cGhlblRvQ2FtZWwobmFtZSk7XG4gIGlmIChjYW1lbCBpbiBlbCkge1xuICAgIGVsW2NhbWVsXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH1cbn07XG5cbmFwaS5nZXRBdHRyID0gZnVuY3Rpb24gKGVsLCBuYW1lKSB7XG4gIHZhciBjYW1lbCA9IHRleHQuaHlwaGVuVG9DYW1lbChuYW1lKTtcbiAgaWYgKGNhbWVsIGluIGVsKSB7XG4gICAgcmV0dXJuIGVsW2NhbWVsXTtcbiAgfSBlbHNlIGlmIChlbC5nZXRBdHRyaWJ1dGUpIHtcbiAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuYXBpLm1hbnlBdHRyID0gZnVuY3Rpb24gKGVsZW0sIGF0dHJzKSB7XG4gIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgYXBpLmF0dHIoZWxlbSwgYXR0ciwgYXR0cnNbYXR0cl0pO1xuICB9KTtcbn07XG5cbmFwaS5tYWtlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIG5ldyBEb21pbnVzKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSkpO1xufTtcblxuYXBpLmNsb25lID0gZnVuY3Rpb24gKGVsKSB7XG4gIGlmIChlbC5jbG9uZU5vZGUpIHtcbiAgICByZXR1cm4gZWwuY2xvbmVOb2RlKHRydWUpO1xuICB9XG4gIHJldHVybiBlbDtcbn07XG5cbmFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgaWYgKGVsLnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxufTtcblxuYXBpLmFwcGVuZCA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkuYXBwZW5kKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWwuYXBwZW5kQ2hpbGQpIHtcbiAgICBlbC5hcHBlbmRDaGlsZCh0YXJnZXQpO1xuICB9XG59O1xuXG5hcGkucHJlcGVuZCA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkucHJlcGVuZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGVsLmluc2VydEJlZm9yZSkge1xuICAgIGVsLmluc2VydEJlZm9yZSh0YXJnZXQsIGVsLmZpcnN0Q2hpbGQpO1xuICB9XG59O1xuXG5hcGkuYmVmb3JlID0gZnVuY3Rpb24gKGVsLCB0YXJnZXQpIHtcbiAgaWYgKG1hbmlwdWxhdGlvbkd1YXJkKGVsLCB0YXJnZXQsIGFwaS5iZWZvcmUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWwucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGFyZ2V0LCBlbCk7XG4gIH1cbn07XG5cbmFwaS5hZnRlciA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkuYWZ0ZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWwucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGFyZ2V0LCBlbC5uZXh0U2libGluZyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hbmlwdWxhdGlvbkd1YXJkIChlbCwgdGFyZ2V0LCBmbikge1xuICB2YXIgcmlnaHQgPSB0YXJnZXQgaW5zdGFuY2VvZiBEb21pbnVzO1xuICB2YXIgbGVmdCA9IGVsIGluc3RhbmNlb2YgRG9taW51cztcbiAgaWYgKGxlZnQpIHtcbiAgICBlbC5mb3JFYWNoKG1hbmlwdWxhdGVNYW55KTtcbiAgfSBlbHNlIGlmIChyaWdodCkge1xuICAgIG1hbmlwdWxhdGUoZWwsIHRydWUpO1xuICB9XG4gIHJldHVybiAhZWwgfHwgIXRhcmdldCB8fCBsZWZ0IHx8IHJpZ2h0O1xuXG4gIGZ1bmN0aW9uIG1hbmlwdWxhdGUgKGVsLCBwcmVjb25kaXRpb24pIHtcbiAgICBpZiAocmlnaHQpIHtcbiAgICAgIHRhcmdldC5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQsIGopIHtcbiAgICAgICAgZm4oZWwsIGNsb25lVW5sZXNzKHRhcmdldCwgcHJlY29uZGl0aW9uICYmIGogPT09IDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbihlbCwgY2xvbmVVbmxlc3ModGFyZ2V0LCBwcmVjb25kaXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYW5pcHVsYXRlTWFueSAoZWwsIGkpIHtcbiAgICBtYW5pcHVsYXRlKGVsLCBpID09PSAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZVVubGVzcyAodGFyZ2V0LCBjb25kaXRpb24pIHtcbiAgcmV0dXJuIGNvbmRpdGlvbiA/IHRhcmdldCA6IGFwaS5jbG9uZSh0YXJnZXQpO1xufVxuXG5bJ2FwcGVuZFRvJywgJ3ByZXBlbmRUbycsICdiZWZvcmVPZicsICdhZnRlck9mJ10uZm9yRWFjaChmbGlwKTtcblxuZnVuY3Rpb24gZmxpcCAoa2V5KSB7XG4gIHZhciBvcmlnaW5hbCA9IGtleS5zcGxpdCgvW0EtWl0vKVswXTtcbiAgYXBpW2tleV0gPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICAgIGFwaVtvcmlnaW5hbF0odGFyZ2V0LCBlbCk7XG4gIH07XG59XG5cbnZhciBudW1lcmljQ3NzUHJvcGVydGllcyA9IHtcbiAgJ2NvbHVtbi1jb3VudCc6IHRydWUsXG4gICdmaWxsLW9wYWNpdHknOiB0cnVlLFxuICAnZmxleC1ncm93JzogdHJ1ZSxcbiAgJ2ZsZXgtc2hyaW5rJzogdHJ1ZSxcbiAgJ2ZvbnQtd2VpZ2h0JzogdHJ1ZSxcbiAgJ2xpbmUtaGVpZ2h0JzogdHJ1ZSxcbiAgJ29wYWNpdHknOiB0cnVlLFxuICAnb3JkZXInOiB0cnVlLFxuICAnb3JwaGFucyc6IHRydWUsXG4gICd3aWRvd3MnOiB0cnVlLFxuICAnei1pbmRleCc6IHRydWUsXG4gICd6b29tJzogdHJ1ZVxufTtcbnZhciBudW1lcmljID0gL15cXGQrJC87XG52YXIgY2FuRmxvYXQgPSAnZmxvYXQnIGluIGRvY3VtZW50LmJvZHkuc3R5bGU7XG5cbmFwaS5nZXRDc3MgPSBmdW5jdGlvbiAoZWwsIHByb3ApIHtcbiAgaWYgKCF0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgaHByb3AgPSB0ZXh0Lmh5cGhlbmF0ZShwcm9wKTtcbiAgdmFyIGZwcm9wID0gIWNhbkZsb2F0ICYmIGhwcm9wID09PSAnZmxvYXQnID8gJ2Nzc0Zsb2F0JyA6IGhwcm9wO1xuICB2YXIgcmVzdWx0ID0gZ2xvYmFsLmdldENvbXB1dGVkU3R5bGUoZWwpW2hwcm9wXTtcbiAgaWYgKHByb3AgPT09ICdvcGFjaXR5JyAmJiByZXN1bHQgPT09ICcnKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgaWYgKHJlc3VsdC5zdWJzdHIoLTIpID09PSAncHgnIHx8IG51bWVyaWMudGVzdChyZXN1bHQpKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQocmVzdWx0LCAxMCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmFwaS5zZXRDc3MgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgdmFyIG1hcHBlZCA9IE9iamVjdC5rZXlzKHByb3BzKS5maWx0ZXIoYmFkKS5tYXAoZXhwYW5kKTtcbiAgZnVuY3Rpb24gYmFkIChwcm9wKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvcHNbcHJvcF07XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHZhbHVlID09PSB2YWx1ZTtcbiAgfVxuICBmdW5jdGlvbiBleHBhbmQgKHByb3ApIHtcbiAgICB2YXIgaHByb3AgPSB0ZXh0Lmh5cGhlbmF0ZShwcm9wKTtcbiAgICB2YXIgdmFsdWUgPSBwcm9wc1twcm9wXTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhbnVtZXJpY0Nzc1Byb3BlcnRpZXNbaHByb3BdKSB7XG4gICAgICB2YWx1ZSArPSAncHgnO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogaHByb3AsIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbCkge1xuICAgIGlmICghdGVzdC5pc0VsZW1lbnQoZWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG1hcHBlZC5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICBlbC5zdHlsZVtwcm9wLm5hbWVdID0gcHJvcC52YWx1ZTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9Eb21pbnVzLnByb3RvdHlwZScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG5cbmZ1bmN0aW9uIGZsYXR0ZW4gKGEsIGNhY2hlKSB7XG4gIHJldHVybiBhLnJlZHVjZShmdW5jdGlvbiAoY3VycmVudCwgaXRlbSkge1xuICAgIGlmIChEb21pbnVzLmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIHJldHVybiBmbGF0dGVuKGl0ZW0sIGN1cnJlbnQpO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudC5pbmRleE9mKGl0ZW0pID09PSAtMSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnQuY29uY2F0KGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudDtcbiAgfSwgY2FjaGUgfHwgbmV3IERvbWludXMoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmxhdHRlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4vZG9tJyk7XG52YXIgY2FzdCA9IHJlcXVpcmUoJy4vY2FzdCcpO1xudmFyIGN1c3RvbSA9IHJlcXVpcmUoJy4vY3VzdG9tJyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG52YXIgdGFnID0gL15cXHMqPChbYS16XSsoPzotW2Etel0rKT8pXFxzKlxcLz8+XFxzKiQvaTtcblxuZnVuY3Rpb24gYXBpIChzZWxlY3RvciwgY29udGV4dCkge1xuICB2YXIgbm90VGV4dCA9IHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZyc7XG4gIGlmIChub3RUZXh0ICYmIGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGNhc3Qoc2VsZWN0b3IpO1xuICB9XG4gIGlmIChub3RUZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH1cbiAgdmFyIG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaCh0YWcpO1xuICBpZiAobWF0Y2hlcykge1xuICAgIHJldHVybiBkb20ubWFrZShtYXRjaGVzWzFdKTtcbiAgfVxuICByZXR1cm4gYXBpLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQpO1xufVxuXG5hcGkuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICByZXR1cm4gZG9tLnFzYShjb250ZXh0LCBzZWxlY3Rvcik7XG59O1xuXG5hcGkuZmluZE9uZSA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICByZXR1cm4gZG9tLnFzKGNvbnRleHQsIHNlbGVjdG9yKTtcbn07XG5cbmFwaS5jdXN0b20gPSBjdXN0b20ucmVnaXN0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZWxlbWVudE9iamVjdHMgPSB0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdvYmplY3QnO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnQgKG8pIHtcbiAgcmV0dXJuIGVsZW1lbnRPYmplY3RzID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogaXNFbGVtZW50T2JqZWN0KG8pO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnRPYmplY3QgKG8pIHtcbiAgcmV0dXJuIG8gJiZcbiAgICB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICBvLm5vZGVUeXBlID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5IChhKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbmZ1bmN0aW9uIGlzQ2hlY2thYmxlIChlbGVtKSB7XG4gIHJldHVybiAnY2hlY2tlZCcgaW4gZWxlbSAmJiBlbGVtLnR5cGUgPT09ICdyYWRpbycgfHwgZWxlbS50eXBlID09PSAnY2hlY2tib3gnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQ2hlY2thYmxlOiBpc0NoZWNrYWJsZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaHlwaGVuVG9DYW1lbCAoaHlwaGVucykge1xuICB2YXIgcGFydCA9IC8tKFthLXpdKS9nO1xuICByZXR1cm4gaHlwaGVucy5yZXBsYWNlKHBhcnQsIGZ1bmN0aW9uIChnLCBtKSB7XG4gICAgcmV0dXJuIG0udG9VcHBlckNhc2UoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGh5cGhlbmF0ZSAodGV4dCkge1xuICB2YXIgY2FtZWwgPSAvKFthLXpdKShbQS1aXSkvZztcbiAgcmV0dXJuIHRleHQucmVwbGFjZShjYW1lbCwgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGh5cGhlblRvQ2FtZWw6IGh5cGhlblRvQ2FtZWwsXG4gIGh5cGhlbmF0ZTogaHlwaGVuYXRlXG59O1xuIl19
