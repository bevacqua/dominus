(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dominus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

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
  return el.detachEvent('on' + type, unwrap(el, type, fn));
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

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

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
if (!document) {
  return;
}
var del = document.documentElement;
var match = del.matches ||
            del.webkitMatchesSelector ||
            del.mozMatchesSelector ||
            del.oMatchesSelector ||
            del.msMatchesSelector;

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

function find (selector, ctx, collection, seed) {
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
  return find(selector, null, null, elements);
}

function matchesSelector (element, selector) {
  return match.call(element, selector);
}

module.exports = find;

find.matches = matches;
find.matchesSelector = matchesSelector;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9jcm9zc3ZlbnQuanMiLCJub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9ldmVudG1hcC5qcyIsIm5vZGVfbW9kdWxlcy9jdXN0b20tZXZlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcG9zZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcG9zZXIvc3JjL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2VrdG9yL3NyYy9zZWt0b3IuanMiLCJzcmMvRG9taW51cy5jdG9yLmpzIiwic3JjL0RvbWludXMucHJvdG90eXBlLmpzIiwic3JjL2FwcGx5LmpzIiwic3JjL2Nhc3QuanMiLCJzcmMvY2xhc3Nlcy5qcyIsInNyYy9jdXN0b20uanMiLCJzcmMvZG9tLmpzIiwic3JjL2RvbWludXMuanMiLCJzcmMvZmxhdHRlbi5qcyIsInNyYy9wdWJsaWMuanMiLCJzcmMvdGVzdC5qcyIsInNyYy90ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNWQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjdXN0b21FdmVudCA9IHJlcXVpcmUoJ2N1c3RvbS1ldmVudCcpO1xudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xudmFyIGRvYyA9IGRvY3VtZW50O1xudmFyIGFkZEV2ZW50ID0gYWRkRXZlbnRFYXN5O1xudmFyIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRFYXN5O1xudmFyIGhhcmRDYWNoZSA9IFtdO1xuXG5pZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gIGFkZEV2ZW50ID0gYWRkRXZlbnRIYXJkO1xuICByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50SGFyZDtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCB3cmFwKGVsLCB0eXBlLCBmbikpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIHVud3JhcChlbCwgdHlwZSwgZm4pKTtcbn1cblxuZnVuY3Rpb24gZmFicmljYXRlRXZlbnQgKGVsLCB0eXBlLCBtb2RlbCkge1xuICB2YXIgZSA9IGV2ZW50bWFwLmluZGV4T2YodHlwZSkgPT09IC0xID8gbWFrZUN1c3RvbUV2ZW50KCkgOiBtYWtlQ2xhc3NpY0V2ZW50KCk7XG4gIGlmIChlbC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5maXJlRXZlbnQoJ29uJyArIHR5cGUsIGUpO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDbGFzc2ljRXZlbnQgKCkge1xuICAgIHZhciBlO1xuICAgIGlmIChkb2MuY3JlYXRlRXZlbnQpIHtcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGRvYy5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgIH1cbiAgICByZXR1cm4gZTtcbiAgfVxuICBmdW5jdGlvbiBtYWtlQ3VzdG9tRXZlbnQgKCkge1xuICAgIHJldHVybiBuZXcgY3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IG1vZGVsIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZXJGYWN0b3J5IChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIgKG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IG9yaWdpbmFsRXZlbnQgfHwgZ2xvYmFsLmV2ZW50O1xuICAgIGUudGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGUucHJldmVudERlZmF1bHQgPSBlLnByZXZlbnREZWZhdWx0IHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICgpIHsgZS5jYW5jZWxCdWJibGUgPSB0cnVlOyB9O1xuICAgIGUud2hpY2ggPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICBmbi5jYWxsKGVsLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciB3cmFwcGVyID0gdW53cmFwKGVsLCB0eXBlLCBmbikgfHwgd3JhcHBlckZhY3RvcnkoZWwsIHR5cGUsIGZuKTtcbiAgaGFyZENhY2hlLnB1c2goe1xuICAgIHdyYXBwZXI6IHdyYXBwZXIsXG4gICAgZWxlbWVudDogZWwsXG4gICAgdHlwZTogdHlwZSxcbiAgICBmbjogZm5cbiAgfSk7XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiB1bndyYXAgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgaSA9IGZpbmQoZWwsIHR5cGUsIGZuKTtcbiAgaWYgKGkpIHtcbiAgICB2YXIgd3JhcHBlciA9IGhhcmRDYWNoZVtpXS53cmFwcGVyO1xuICAgIGhhcmRDYWNoZS5zcGxpY2UoaSwgMSk7IC8vIGZyZWUgdXAgYSB0YWQgb2YgbWVtb3J5XG4gICAgcmV0dXJuIHdyYXBwZXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpLCBpdGVtO1xuICBmb3IgKGkgPSAwOyBpIDwgaGFyZENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgaXRlbSA9IGhhcmRDYWNoZVtpXTtcbiAgICBpZiAoaXRlbS5lbGVtZW50ID09PSBlbCAmJiBpdGVtLnR5cGUgPT09IHR5cGUgJiYgaXRlbS5mbiA9PT0gZm4pIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudCxcbiAgZmFicmljYXRlOiBmYWJyaWNhdGVFdmVudFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50bWFwID0gW107XG52YXIgZXZlbnRuYW1lID0gJyc7XG52YXIgcm9uID0gL15vbi87XG5cbmZvciAoZXZlbnRuYW1lIGluIGdsb2JhbCkge1xuICBpZiAocm9uLnRlc3QoZXZlbnRuYW1lKSkge1xuICAgIGV2ZW50bWFwLnB1c2goZXZlbnRuYW1lLnNsaWNlKDIpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50bWFwO1xuIiwiXG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbmZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHAgPSBuZXcgTmF0aXZlQ3VzdG9tRXZlbnQoJ2NhdCcsIHsgZGV0YWlsOiB7IGZvbzogJ2JhcicgfSB9KTtcbiAgICByZXR1cm4gICdjYXQnID09PSBwLnR5cGUgJiYgJ2JhcicgPT09IHAuZGV0YWlsLmZvbztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50LkN1c3RvbUV2ZW50XG4gKlxuICogQHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBOYXRpdmVDdXN0b21FdmVudCA6XG5cbi8vIElFID49IDlcbidmdW5jdGlvbicgPT09IHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA/IGZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gIH0gZWxzZSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xuICB9XG4gIHJldHVybiBlO1xufSA6XG5cbi8vIElFIDw9IDhcbmZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICBlLnR5cGUgPSB0eXBlO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICB9IGVsc2Uge1xuICAgIGUuYnViYmxlcyA9IGZhbHNlO1xuICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgIGUuZGV0YWlsID0gdm9pZCAwO1xuICB9XG4gIHJldHVybiBlO1xufVxuIiwidmFyIHBvc2VyID0gcmVxdWlyZSgnLi9zcmMvbm9kZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2VyO1xuXG5bJ0FycmF5JywgJ0Z1bmN0aW9uJywgJ09iamVjdCcsICdEYXRlJywgJ1N0cmluZyddLmZvckVhY2gocG9zZSk7XG5cbmZ1bmN0aW9uIHBvc2UgKHR5cGUpIHtcbiAgcG9zZXJbdHlwZV0gPSBmdW5jdGlvbiBwb3NlQ29tcHV0ZWRUeXBlICgpIHsgcmV0dXJuIHBvc2VyKHR5cGUpOyB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZCA9IGdsb2JhbC5kb2N1bWVudDtcblxuZnVuY3Rpb24gcG9zZXIgKHR5cGUpIHtcbiAgdmFyIGlmcmFtZSA9IGQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG5cbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXG4gIHJldHVybiBtYXAodHlwZSwgaWZyYW1lLmNvbnRlbnRXaW5kb3cpO1xufVxuXG5mdW5jdGlvbiBtYXAgKHR5cGUsIHNvdXJjZSkgeyAvLyBmb3J3YXJkIHBvbHlmaWxscyB0byB0aGUgc3RvbGVuIHJlZmVyZW5jZSFcbiAgdmFyIG9yaWdpbmFsID0gd2luZG93W3R5cGVdLnByb3RvdHlwZTtcbiAgdmFyIHZhbHVlID0gc291cmNlW3R5cGVdO1xuICB2YXIgcHJvcDtcblxuICBmb3IgKHByb3AgaW4gb3JpZ2luYWwpIHtcbiAgICB2YWx1ZS5wcm90b3R5cGVbcHJvcF0gPSBvcmlnaW5hbFtwcm9wXTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwb3NlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV4cGFuZG8gPSAnc2VrdG9yLScgKyBEYXRlLm5vdygpO1xudmFyIHJzaWJsaW5ncyA9IC9bK35dLztcbnZhciBkb2N1bWVudCA9IGdsb2JhbC5kb2N1bWVudDtcbmlmICghZG9jdW1lbnQpIHtcbiAgcmV0dXJuO1xufVxudmFyIGRlbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciBtYXRjaCA9IGRlbC5tYXRjaGVzIHx8XG4gICAgICAgICAgICBkZWwud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICBkZWwubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICBkZWwub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgZGVsLm1zTWF0Y2hlc1NlbGVjdG9yO1xuXG5mdW5jdGlvbiBxc2EgKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gIHZhciBleGlzdGVkLCBpZCwgcHJlZml4LCBwcmVmaXhlZCwgYWRhcHRlciwgaGFjayA9IGNvbnRleHQgIT09IGRvY3VtZW50O1xuICBpZiAoaGFjaykgeyAvLyBpZCBoYWNrIGZvciBjb250ZXh0LXJvb3RlZCBxdWVyaWVzXG4gICAgZXhpc3RlZCA9IGNvbnRleHQuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgIGlkID0gZXhpc3RlZCB8fCBleHBhbmRvO1xuICAgIHByZWZpeCA9ICcjJyArIGlkICsgJyAnO1xuICAgIHByZWZpeGVkID0gcHJlZml4ICsgc2VsZWN0b3IucmVwbGFjZSgvLC9nLCAnLCcgKyBwcmVmaXgpO1xuICAgIGFkYXB0ZXIgPSByc2libGluZ3MudGVzdChzZWxlY3RvcikgJiYgY29udGV4dC5wYXJlbnROb2RlO1xuICAgIGlmICghZXhpc3RlZCkgeyBjb250ZXh0LnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7IH1cbiAgfVxuICB0cnkge1xuICAgIHJldHVybiAoYWRhcHRlciB8fCBjb250ZXh0KS5xdWVyeVNlbGVjdG9yQWxsKHByZWZpeGVkIHx8IHNlbGVjdG9yKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBbXTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoZXhpc3RlZCA9PT0gbnVsbCkgeyBjb250ZXh0LnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTsgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmQgKHNlbGVjdG9yLCBjdHgsIGNvbGxlY3Rpb24sIHNlZWQpIHtcbiAgdmFyIGVsZW1lbnQ7XG4gIHZhciBjb250ZXh0ID0gY3R4IHx8IGRvY3VtZW50O1xuICB2YXIgcmVzdWx0cyA9IGNvbGxlY3Rpb24gfHwgW107XG4gIHZhciBpID0gMDtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuICBpZiAoY29udGV4dC5ub2RlVHlwZSAhPT0gMSAmJiBjb250ZXh0Lm5vZGVUeXBlICE9PSA5KSB7XG4gICAgcmV0dXJuIFtdOyAvLyBiYWlsIGlmIGNvbnRleHQgaXMgbm90IGFuIGVsZW1lbnQgb3IgZG9jdW1lbnRcbiAgfVxuICBpZiAoc2VlZCkge1xuICAgIHdoaWxlICgoZWxlbWVudCA9IHNlZWRbaSsrXSkpIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0cy5wdXNoLmFwcGx5KHJlc3VsdHMsIHFzYShzZWxlY3RvciwgY29udGV4dCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzIChzZWxlY3RvciwgZWxlbWVudHMpIHtcbiAgcmV0dXJuIGZpbmQoc2VsZWN0b3IsIG51bGwsIG51bGwsIGVsZW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yIChlbGVtZW50LCBzZWxlY3Rvcikge1xuICByZXR1cm4gbWF0Y2guY2FsbChlbGVtZW50LCBzZWxlY3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmluZDtcblxuZmluZC5tYXRjaGVzID0gbWF0Y2hlcztcbmZpbmQubWF0Y2hlc1NlbGVjdG9yID0gbWF0Y2hlc1NlbGVjdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcG9zZXIgPSByZXF1aXJlKCdwb3NlcicpO1xudmFyIERvbWludXMgPSBwb3Nlci5BcnJheSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERvbWludXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnLi9wdWJsaWMnKTtcbnZhciBmbGF0dGVuID0gcmVxdWlyZSgnLi9mbGF0dGVuJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb20nKTtcbnZhciBjdXN0b20gPSByZXF1aXJlKCcuL2N1c3RvbScpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMnKTtcbnZhciBEb21pbnVzID0gcmVxdWlyZSgnLi9Eb21pbnVzLmN0b3InKTtcblxuZnVuY3Rpb24gZXF1YWxzIChzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24gZXF1YWxzIChlbGVtKSB7XG4gICAgcmV0dXJuIGRvbS5tYXRjaGVzKGVsZW0sIHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RyYWlnaHQgKHByb3AsIG9uZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZG9tTWFwcGluZyAoc2VsZWN0b3IpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5tYXAoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHJldHVybiBkb21bcHJvcF0oZWxlbSwgc2VsZWN0b3IpO1xuICAgIH0pO1xuICAgIHZhciByZXN1bHRzID0gZmxhdHRlbihyZXN1bHQpO1xuICAgIHJldHVybiBvbmUgPyByZXN1bHRzWzBdIDogcmVzdWx0cztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUucHJldiA9IHN0cmFpZ2h0KCdwcmV2Jyk7XG5Eb21pbnVzLnByb3RvdHlwZS5uZXh0ID0gc3RyYWlnaHQoJ25leHQnKTtcbkRvbWludXMucHJvdG90eXBlLnBhcmVudCA9IHN0cmFpZ2h0KCdwYXJlbnQnKTtcbkRvbWludXMucHJvdG90eXBlLnBhcmVudHMgPSBzdHJhaWdodCgncGFyZW50cycpO1xuRG9taW51cy5wcm90b3R5cGUuY2hpbGRyZW4gPSBzdHJhaWdodCgnY2hpbGRyZW4nKTtcbkRvbWludXMucHJvdG90eXBlLmZpbmQgPSBzdHJhaWdodCgncXNhJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5maW5kT25lID0gc3RyYWlnaHQoJ3FzJywgdHJ1ZSk7XG5cbkRvbWludXMucHJvdG90eXBlLndoZXJlID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0aGlzLmZpbHRlcihlcXVhbHMoc2VsZWN0b3IpKTtcbn07XG5cbkRvbWludXMucHJvdG90eXBlLmlzID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0aGlzLnNvbWUoZXF1YWxzKHNlbGVjdG9yKSk7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIHJldHVybiB0aGlzW2luZGV4XSA/IG5ldyBEb21pbnVzKHRoaXNbaW5kZXhdKSA6IG5ldyBEb21pbnVzKCk7XG59O1xuXG5mdW5jdGlvbiBjb21wYXJlRmFjdG9yeSAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbXBhcmUgKCkge1xuICAgICQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5mb3JFYWNoKGZuLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUuYW5kID0gY29tcGFyZUZhY3RvcnkoZnVuY3Rpb24gYWRkT25lIChlbGVtKSB7XG4gIGlmICh0aGlzLmluZGV4T2YoZWxlbSkgPT09IC0xKSB7XG4gICAgdGhpcy5wdXNoKGVsZW0pO1xuICB9XG4gIHJldHVybiB0aGlzO1xufSk7XG5cbkRvbWludXMucHJvdG90eXBlLmJ1dCA9IGNvbXBhcmVGYWN0b3J5KGZ1bmN0aW9uIGFkZE9uZSAoZWxlbSkge1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YoZWxlbSk7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59KTtcblxuRG9taW51cy5wcm90b3R5cGUuY3NzID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBwcm9wcztcbiAgdmFyIG1hbnkgPSBuYW1lICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JztcbiAgdmFyIGdldHRlciA9ICFtYW55ICYmICF2YWx1ZTtcbiAgaWYgKGdldHRlcikge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA/IGRvbS5nZXRDc3ModGhpc1swXSwgbmFtZSkgOiBudWxsO1xuICB9XG4gIGlmIChtYW55KSB7XG4gICAgcHJvcHMgPSBuYW1lO1xuICB9IGVsc2Uge1xuICAgIHByb3BzID0ge307XG4gICAgcHJvcHNbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuICB0aGlzLmZvckVhY2goZG9tLnNldENzcyhwcm9wcykpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGV2ZW50ZXIgKG1ldGhvZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHR5cGVzLCBmaWx0ZXIsIGZuKSB7XG4gICAgdmFyIHR5cGVsaXN0ID0gdHlwZXMuc3BsaXQoJyAnKTtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbiA9IGZpbHRlcjtcbiAgICAgIGZpbHRlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgdHlwZWxpc3QuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IGN1c3RvbS5oYW5kbGVyc1t0eXBlXTtcbiAgICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgICBkb21bbWV0aG9kXShlbGVtLCBoYW5kbGVyLmV2ZW50LCBmaWx0ZXIsIGhhbmRsZXIud3JhcChmbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbVttZXRob2RdKGVsZW0sIHR5cGUsIGZpbHRlciwgZm4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUub25jZSA9IGV2ZW50ZXIoJ29uY2UnKTtcbkRvbWludXMucHJvdG90eXBlLm9uID0gZXZlbnRlcignb24nKTtcbkRvbWludXMucHJvdG90eXBlLm9mZiA9IGV2ZW50ZXIoJ29mZicpO1xuRG9taW51cy5wcm90b3R5cGUuZW1pdCA9IGV2ZW50ZXIoJ2VtaXQnKTtcblxuW1xuICBbJ2FkZENsYXNzJywgY2xhc3Nlcy5hZGRdLFxuICBbJ3JlbW92ZUNsYXNzJywgY2xhc3Nlcy5yZW1vdmVdLFxuICBbJ3NldENsYXNzJywgY2xhc3Nlcy5zZXRdLFxuICBbJ3JlbW92ZUNsYXNzJywgY2xhc3Nlcy5yZW1vdmVdLFxuICBbJ3JlbW92ZScsIGRvbS5yZW1vdmVdXG5dLmZvckVhY2gobWFwTWV0aG9kcyk7XG5cbmZ1bmN0aW9uIG1hcE1ldGhvZHMgKGRhdGEpIHtcbiAgRG9taW51cy5wcm90b3R5cGVbZGF0YVswXV0gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIGRhdGFbMV0oZWxlbSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5bXG4gICdhcHBlbmQnLFxuICAnYXBwZW5kVG8nLFxuICAncHJlcGVuZCcsXG4gICdwcmVwZW5kVG8nLFxuICAnYmVmb3JlJyxcbiAgJ2JlZm9yZU9mJyxcbiAgJ2FmdGVyJyxcbiAgJ2FmdGVyT2YnXG5dLmZvckVhY2gobWFwTWFuaXB1bGF0aW9uKTtcblxuZnVuY3Rpb24gbWFwTWFuaXB1bGF0aW9uIChtZXRob2QpIHtcbiAgRG9taW51cy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGRvbVttZXRob2RdKHRoaXMsIHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuc29tZShmdW5jdGlvbiAoZWxlbSkge1xuICAgIHJldHVybiBjbGFzc2VzLmNvbnRhaW5zKGVsZW0sIHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBoYXNoID0gbmFtZSAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCc7XG4gIHZhciBzZXQgPSBoYXNoID8gc2V0TWFueSA6IHNldFNpbmdsZTtcbiAgdmFyIHNldHRlciA9IGhhc2ggfHwgYXJndW1lbnRzLmxlbmd0aCA+IDE7XG4gIGlmIChzZXR0ZXIpIHtcbiAgICB0aGlzLmZvckVhY2goc2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPyBkb20uZ2V0QXR0cih0aGlzWzBdLCBuYW1lKSA6IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gc2V0TWFueSAoZWxlbSkge1xuICAgIGRvbS5tYW55QXR0cihlbGVtLCBuYW1lKTtcbiAgfVxuICBmdW5jdGlvbiBzZXRTaW5nbGUgKGVsZW0pIHtcbiAgICBkb20uYXR0cihlbGVtLCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGtleVZhbHVlIChrZXksIHZhbHVlKSB7XG4gIHZhciBnZXR0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMjtcbiAgaWYgKGdldHRlcikge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA/IGRvbVtrZXldKHRoaXNbMF0pIDogJyc7XG4gIH1cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgZG9tW2tleV0oZWxlbSwgdmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIGtleVZhbHVlUHJvcGVydHkgKHByb3ApIHtcbiAgRG9taW51cy5wcm90b3R5cGVbcHJvcF0gPSBmdW5jdGlvbiBhY2Nlc3NvciAodmFsdWUpIHtcbiAgICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDE7XG4gICAgaWYgKGdldHRlcikge1xuICAgICAgcmV0dXJuIGtleVZhbHVlLmNhbGwodGhpcywgcHJvcCk7XG4gICAgfVxuICAgIHJldHVybiBrZXlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsIHZhbHVlKTtcbiAgfTtcbn1cblxuWydodG1sJywgJ3RleHQnLCAndmFsdWUnXS5mb3JFYWNoKGtleVZhbHVlUHJvcGVydHkpO1xuXG5Eb21pbnVzLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgcmV0dXJuIGRvbS5jbG9uZShlbGVtKTtcbiAgfSk7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgdGhpc1swXS5mb2N1cygpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3B1YmxpYycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG52YXIgcHJvdG8gPSBEb21pbnVzLnByb3RvdHlwZTtcblxuZnVuY3Rpb24gQXBwbGllZCAoYXJncykge1xuICByZXR1cm4gRG9taW51cy5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuQXBwbGllZC5wcm90b3R5cGUgPSBwcm90bztcblxuZnVuY3Rpb24gYXBwbHkgKGEpIHtcbiAgcmV0dXJuIG5ldyBBcHBsaWVkKGEpO1xufVxuXG5bJ21hcCcsICdmaWx0ZXInLCAnY29uY2F0JywgJ3NsaWNlJ10uZm9yRWFjaChlbnN1cmUpO1xuXG5mdW5jdGlvbiBlbnN1cmUgKGtleSkge1xuICB2YXIgb3JpZ2luYWwgPSBwcm90b1trZXldO1xuICBwcm90b1trZXldID0gZnVuY3Rpb24gYXBwbGllZCAoKSB7XG4gICAgcmV0dXJuIGFwcGx5KG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGVzdCA9IHJlcXVpcmUoJy4vdGVzdCcpO1xudmFyIGFwcGx5ID0gcmVxdWlyZSgnLi9hcHBseScpO1xudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xuXG5mdW5jdGlvbiBjYXN0IChhKSB7XG4gIGlmIChhID09PSBnbG9iYWwpIHtcbiAgICByZXR1cm4gbmV3IERvbWludXMoYSk7XG4gIH1cbiAgaWYgKGEgaW5zdGFuY2VvZiBEb21pbnVzKSB7XG4gICAgcmV0dXJuIGE7XG4gIH1cbiAgaWYgKCFhKSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH1cbiAgaWYgKHRlc3QuaXNFbGVtZW50KGEpKSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKGEpO1xuICB9XG4gIGlmICghdGVzdC5pc0FycmF5KGEpKSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH1cbiAgcmV0dXJuIGFwcGx5KGEpLmZpbHRlcihmdW5jdGlvbiAoaSkge1xuICAgIHJldHVybiB0ZXN0LmlzRWxlbWVudChpKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyaW0gPSAvXlxccyt8XFxzKyQvZztcbnZhciB3aGl0ZXNwYWNlID0gL1xccysvZztcbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG5cbmZ1bmN0aW9uIGludGVycHJldCAoaW5wdXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyBpbnB1dC5yZXBsYWNlKHRyaW0sICcnKS5zcGxpdCh3aGl0ZXNwYWNlKSA6IGlucHV0O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VzIChlbCkge1xuICBpZiAodGVzdC5pc0VsZW1lbnQoZWwpKSB7XG4gICAgcmV0dXJuIGVsLmNsYXNzTmFtZS5yZXBsYWNlKHRyaW0sICcnKS5zcGxpdCh3aGl0ZXNwYWNlKTtcbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIHNldCAoZWwsIGlucHV0KSB7XG4gIGlmICh0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBpbnRlcnByZXQoaW5wdXQpLmpvaW4oJyAnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGQgKGVsLCBpbnB1dCkge1xuICB2YXIgY3VycmVudCA9IHJlbW92ZShlbCwgaW5wdXQpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcbiAgY3VycmVudC5wdXNoLmFwcGx5KGN1cnJlbnQsIHZhbHVlcyk7XG4gIHNldChlbCwgY3VycmVudCk7XG4gIHJldHVybiBjdXJyZW50O1xufVxuXG5mdW5jdGlvbiByZW1vdmUgKGVsLCBpbnB1dCkge1xuICB2YXIgY3VycmVudCA9IGNsYXNzZXMoZWwpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcbiAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGkgPSBjdXJyZW50LmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgY3VycmVudC5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9KTtcbiAgc2V0KGVsLCBjdXJyZW50KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zIChlbCwgaW5wdXQpIHtcbiAgdmFyIGN1cnJlbnQgPSBjbGFzc2VzKGVsKTtcbiAgdmFyIHZhbHVlcyA9IGludGVycHJldChpbnB1dCk7XG5cbiAgcmV0dXJuIHZhbHVlcy5ldmVyeShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gY3VycmVudC5pbmRleE9mKHZhbHVlKSAhPT0gLTE7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGQsXG4gIHJlbW92ZTogcmVtb3ZlLFxuICBjb250YWluczogY29udGFpbnMsXG4gIHNldDogc2V0LFxuICBnZXQ6IGNsYXNzZXNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYW5kbGVycyA9IHt9O1xuXG5mdW5jdGlvbiByZWdpc3RlciAobmFtZSwgdHlwZSwgZmlsdGVyKSB7XG4gIGhhbmRsZXJzW25hbWVdID0ge1xuICAgIGV2ZW50OiB0eXBlLFxuICAgIGZpbHRlcjogZmlsdGVyLFxuICAgIHdyYXA6IHdyYXBcbiAgfTtcblxuICBmdW5jdGlvbiB3cmFwIChmbikge1xuICAgIHJldHVybiB3cmFwcGVyKG5hbWUsIGZuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cmFwcGVyIChuYW1lLCBmbikge1xuICBpZiAoIWZuKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG4gIHZhciBrZXkgPSAnX19kY2VfJyArIG5hbWU7XG4gIGlmIChmbltrZXldKSB7XG4gICAgcmV0dXJuIGZuW2tleV07XG4gIH1cbiAgZm5ba2V5XSA9IGZ1bmN0aW9uIGN1c3RvbUV2ZW50IChlKSB7XG4gICAgdmFyIG1hdGNoID0gaGFuZGxlcnNbbmFtZV0uZmlsdGVyKGUpO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZm5ba2V5XTtcbn1cblxucmVnaXN0ZXIoJ2xlZnQtY2xpY2snLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICByZXR1cm4gZS53aGljaCA9PT0gMSAmJiAhZS5tZXRhS2V5ICYmICFlLmN0cmxLZXk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlZ2lzdGVyOiByZWdpc3RlcixcbiAgd3JhcHBlcjogd3JhcHBlcixcbiAgaGFuZGxlcnM6IGhhbmRsZXJzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VrdG9yID0gcmVxdWlyZSgnc2VrdG9yJyk7XG52YXIgY3Jvc3N2ZW50ID0gcmVxdWlyZSgnY3Jvc3N2ZW50Jyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG52YXIgY2FzdCA9IHJlcXVpcmUoJy4vY2FzdCcpO1xudmFyIGFwcGx5ID0gcmVxdWlyZSgnLi9hcHBseScpO1xudmFyIHRleHQgPSByZXF1aXJlKCcuL3RleHQnKTtcbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG52YXIgYXBpID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBkZWxlZ2F0ZXMgPSB7fTtcblxuZnVuY3Rpb24gY2FzdENvbnRleHQgKGNvbnRleHQpIHtcbiAgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhcGkucXMobnVsbCwgY29udGV4dCk7XG4gIH1cbiAgaWYgKHRlc3QuaXNFbGVtZW50KGNvbnRleHQpKSB7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cbiAgaWYgKGNvbnRleHQgaW5zdGFuY2VvZiBEb21pbnVzKSB7XG4gICAgcmV0dXJuIGNvbnRleHRbMF07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmFwaS5xc2EgPSBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XG4gIHZhciByZXN1bHRzID0gbmV3IERvbWludXMoKTtcbiAgcmV0dXJuIHNla3RvcihzZWxlY3RvciwgY2FzdENvbnRleHQoZWwpLCByZXN1bHRzKTtcbn07XG5cbmFwaS5xcyA9IGZ1bmN0aW9uIChlbCwgc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGFwaS5xc2EoZWwsIHNlbGVjdG9yKVswXTtcbn07XG5cbmFwaS5tYXRjaGVzID0gZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xuICByZXR1cm4gdGVzdC5pc0VsZW1lbnQoZWwpICYmIHNla3Rvci5tYXRjaGVzU2VsZWN0b3IoZWwsIHNlbGVjdG9yKTtcbn07XG5cbmZ1bmN0aW9uIHJlbGF0ZWRGYWN0b3J5IChwcm9wKSB7XG4gIHJldHVybiBmdW5jdGlvbiByZWxhdGVkIChlbCwgc2VsZWN0b3IpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSBlbFtwcm9wXTtcbiAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgIGlmICghc2VsZWN0b3IgfHwgYXBpLm1hdGNoZXMocmVsYXRpdmUsIHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gY2FzdChyZWxhdGl2ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9O1xufVxuXG5hcGkucHJldiA9IHJlbGF0ZWRGYWN0b3J5KCdwcmV2aW91c0VsZW1lbnRTaWJsaW5nJyk7XG5hcGkubmV4dCA9IHJlbGF0ZWRGYWN0b3J5KCduZXh0RWxlbWVudFNpYmxpbmcnKTtcbmFwaS5wYXJlbnQgPSByZWxhdGVkRmFjdG9yeSgncGFyZW50RWxlbWVudCcpO1xuXG5mdW5jdGlvbiBtYXRjaGVzIChlbCwgdmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gdmFsdWUuaW5kZXhPZihlbCkgIT09IC0xO1xuICB9XG4gIGlmICh0ZXN0LmlzRWxlbWVudCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZWwgPT09IHZhbHVlO1xuICB9XG4gIHJldHVybiBhcGkubWF0Y2hlcyhlbCwgdmFsdWUpO1xufVxuXG5hcGkucGFyZW50cyA9IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcbiAgdmFyIGVsZW1lbnRzID0gW107XG4gIHZhciBjdXJyZW50ID0gZWw7XG4gIHdoaWxlIChjdXJyZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICBpZiAobWF0Y2hlcyhjdXJyZW50LnBhcmVudEVsZW1lbnQsIHZhbHVlKSkge1xuICAgICAgZWxlbWVudHMucHVzaChjdXJyZW50LnBhcmVudEVsZW1lbnQpO1xuICAgIH1cbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBhcHBseShlbGVtZW50cyk7XG59O1xuXG5hcGkuY2hpbGRyZW4gPSBmdW5jdGlvbiAoZWwsIHZhbHVlKSB7XG4gIHZhciBlbGVtZW50cyA9IFtdO1xuICB2YXIgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbjtcbiAgdmFyIGNoaWxkO1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgY2hpbGRyZW4gJiYgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBpZiAobWF0Y2hlcyhjaGlsZCwgdmFsdWUpKSB7XG4gICAgICBlbGVtZW50cy5wdXNoKGNoaWxkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFwcGx5KGVsZW1lbnRzKTtcbn07XG5cbi8vIHRoaXMgbWV0aG9kIGNhY2hlcyBkZWxlZ2F0ZXMgc28gdGhhdCAub2ZmKCkgd29ya3Mgc2VhbWxlc3NseVxuZnVuY3Rpb24gZGVsZWdhdGUgKHJvb3QsIGZpbHRlciwgZm4pIHtcbiAgaWYgKGRlbGVnYXRlc1tmbi5fZGRdKSB7XG4gICAgcmV0dXJuIGRlbGVnYXRlc1tmbi5fZGRdO1xuICB9XG4gIGZuLl9kZCA9IERhdGUubm93KCk7XG4gIGRlbGVnYXRlc1tmbi5fZGRdID0gZGVsZWdhdG9yO1xuICBmdW5jdGlvbiBkZWxlZ2F0b3IgKGUpIHtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICB3aGlsZSAoZWwgJiYgZWwgIT09IHJvb3QpIHtcbiAgICAgIGlmIChhcGkubWF0Y2hlcyhlbCwgZmlsdGVyKSkge1xuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyByZXR1cm47XG4gICAgICB9XG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWxlZ2F0b3I7XG59XG5cbmZ1bmN0aW9uIGV2ZW50ZWQgKG1ldGhvZCwgZWwsIHR5cGUsIGZpbHRlciwgZm4pIHtcbiAgaWYgKGZpbHRlciA9PT0gbnVsbCkge1xuICAgIGNyb3NzdmVudFttZXRob2RdKGVsLCB0eXBlLCBmbik7XG4gIH0gZWxzZSB7XG4gICAgY3Jvc3N2ZW50W21ldGhvZF0oZWwsIHR5cGUsIGRlbGVnYXRlKGVsLCBmaWx0ZXIsIGZuKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25jZSAoZWwsIHR5cGUsIGZpbHRlciwgZm4pIHtcbiAgdmFyIHRoaW5ncyA9IFtlbCwgdHlwZSwgZmlsdGVyLCBkaXNwb3NhYmxlXTtcbiAgYXBpLm9uLmFwcGx5KGFwaSwgdGhpbmdzKTtcbiAgZnVuY3Rpb24gZGlzcG9zYWJsZSAoKSB7XG4gICAgYXBpLm9mZi5hcHBseShhcGksIHRoaW5ncyk7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuYXBpLm9uY2UgPSBvbmNlO1xuYXBpLm9uID0gZXZlbnRlZC5iaW5kKG51bGwsICdhZGQnKTtcbmFwaS5vZmYgPSBldmVudGVkLmJpbmQobnVsbCwgJ3JlbW92ZScpO1xuYXBpLmVtaXQgPSBldmVudGVkLmJpbmQobnVsbCwgJ2ZhYnJpY2F0ZScpO1xuXG5hcGkuaHRtbCA9IGZ1bmN0aW9uIChlbGVtLCBodG1sKSB7XG4gIHZhciBnZXR0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMjtcbiAgaWYgKGdldHRlcikge1xuICAgIHJldHVybiBlbGVtLmlubmVySFRNTDtcbiAgfSBlbHNlIHtcbiAgICBlbGVtLmlubmVySFRNTCA9IGh0bWw7XG4gIH1cbn07XG5cbmFwaS50ZXh0ID0gZnVuY3Rpb24gKGVsZW0sIHRleHQpIHtcbiAgdmFyIGNoZWNrYWJsZSA9IHRlc3QuaXNDaGVja2FibGUoZWxlbSk7XG4gIHZhciBnZXR0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMjtcbiAgaWYgKGdldHRlcikge1xuICAgIHJldHVybiBjaGVja2FibGUgPyBlbGVtLnZhbHVlIDogZWxlbS5pbm5lclRleHQgfHwgZWxlbS50ZXh0Q29udGVudDtcbiAgfSBlbHNlIGlmIChjaGVja2FibGUpIHtcbiAgICBlbGVtLnZhbHVlID0gdGV4dDtcbiAgfSBlbHNlIHtcbiAgICBlbGVtLmlubmVyVGV4dCA9IGVsZW0udGV4dENvbnRlbnQgPSB0ZXh0O1xuICB9XG59O1xuXG5hcGkudmFsdWUgPSBmdW5jdGlvbiAoZWwsIHZhbHVlKSB7XG4gIHZhciBjaGVja2FibGUgPSB0ZXN0LmlzQ2hlY2thYmxlKGVsKTtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGNoZWNrYWJsZSA/IGVsLmNoZWNrZWQgOiBlbC52YWx1ZTtcbiAgfSBlbHNlIGlmIChjaGVja2FibGUpIHtcbiAgICBlbC5jaGVja2VkID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgZWwudmFsdWUgPSB2YWx1ZTtcbiAgfVxufTtcblxuYXBpLmF0dHIgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gIGlmICghdGVzdC5pc0VsZW1lbnQoZWwpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpOyByZXR1cm47XG4gIH1cbiAgdmFyIGNhbWVsID0gdGV4dC5oeXBoZW5Ub0NhbWVsKG5hbWUpO1xuICBpZiAoY2FtZWwgaW4gZWwpIHtcbiAgICBlbFtjYW1lbF0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9XG59O1xuXG5hcGkuZ2V0QXR0ciA9IGZ1bmN0aW9uIChlbCwgbmFtZSkge1xuICB2YXIgY2FtZWwgPSB0ZXh0Lmh5cGhlblRvQ2FtZWwobmFtZSk7XG4gIGlmIChjYW1lbCBpbiBlbCkge1xuICAgIHJldHVybiBlbFtjYW1lbF07XG4gIH0gZWxzZSBpZiAoZWwuZ2V0QXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmFwaS5tYW55QXR0ciA9IGZ1bmN0aW9uIChlbGVtLCBhdHRycykge1xuICBPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoYXR0cikge1xuICAgIGFwaS5hdHRyKGVsZW0sIGF0dHIsIGF0dHJzW2F0dHJdKTtcbiAgfSk7XG59O1xuXG5hcGkubWFrZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiBuZXcgRG9taW51cyhkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpKTtcbn07XG5cbmFwaS5jbG9uZSA9IGZ1bmN0aW9uIChlbCkge1xuICBpZiAoZWwuY2xvbmVOb2RlKSB7XG4gICAgcmV0dXJuIGVsLmNsb25lTm9kZSh0cnVlKTtcbiAgfVxuICByZXR1cm4gZWw7XG59O1xuXG5hcGkucmVtb3ZlID0gZnVuY3Rpb24gKGVsKSB7XG4gIGlmIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH1cbn07XG5cbmFwaS5hcHBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICBpZiAobWFuaXB1bGF0aW9uR3VhcmQoZWwsIHRhcmdldCwgYXBpLmFwcGVuZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGVsLmFwcGVuZENoaWxkKSB7XG4gICAgZWwuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcbiAgfVxufTtcblxuYXBpLnByZXBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICBpZiAobWFuaXB1bGF0aW9uR3VhcmQoZWwsIHRhcmdldCwgYXBpLnByZXBlbmQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbC5pbnNlcnRCZWZvcmUpIHtcbiAgICBlbC5pbnNlcnRCZWZvcmUodGFyZ2V0LCBlbC5maXJzdENoaWxkKTtcbiAgfVxufTtcblxuYXBpLmJlZm9yZSA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkuYmVmb3JlKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWwucGFyZW50RWxlbWVudCkge1xuICAgIGVsLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRhcmdldCwgZWwpO1xuICB9XG59O1xuXG5hcGkuYWZ0ZXIgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICBpZiAobWFuaXB1bGF0aW9uR3VhcmQoZWwsIHRhcmdldCwgYXBpLmFmdGVyKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWwucGFyZW50RWxlbWVudCkge1xuICAgIGVsLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRhcmdldCwgZWwubmV4dFNpYmxpbmcpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYW5pcHVsYXRpb25HdWFyZCAoZWwsIHRhcmdldCwgZm4pIHtcbiAgdmFyIHJpZ2h0ID0gdGFyZ2V0IGluc3RhbmNlb2YgRG9taW51cztcbiAgdmFyIGxlZnQgPSBlbCBpbnN0YW5jZW9mIERvbWludXM7XG4gIGlmIChsZWZ0KSB7XG4gICAgZWwuZm9yRWFjaChtYW5pcHVsYXRlTWFueSk7XG4gIH0gZWxzZSBpZiAocmlnaHQpIHtcbiAgICBtYW5pcHVsYXRlKGVsLCB0cnVlKTtcbiAgfVxuICByZXR1cm4gIWVsIHx8ICF0YXJnZXQgfHwgbGVmdCB8fCByaWdodDtcblxuICBmdW5jdGlvbiBtYW5pcHVsYXRlIChlbCwgcHJlY29uZGl0aW9uKSB7XG4gICAgaWYgKHJpZ2h0KSB7XG4gICAgICB0YXJnZXQuZm9yRWFjaChmdW5jdGlvbiAodGFyZ2V0LCBqKSB7XG4gICAgICAgIGZuKGVsLCBjbG9uZVVubGVzcyh0YXJnZXQsIHByZWNvbmRpdGlvbiAmJiBqID09PSAwKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4oZWwsIGNsb25lVW5sZXNzKHRhcmdldCwgcHJlY29uZGl0aW9uKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFuaXB1bGF0ZU1hbnkgKGVsLCBpKSB7XG4gICAgbWFuaXB1bGF0ZShlbCwgaSA9PT0gMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvbmVVbmxlc3MgKHRhcmdldCwgY29uZGl0aW9uKSB7XG4gIHJldHVybiBjb25kaXRpb24gPyB0YXJnZXQgOiBhcGkuY2xvbmUodGFyZ2V0KTtcbn1cblxuWydhcHBlbmRUbycsICdwcmVwZW5kVG8nLCAnYmVmb3JlT2YnLCAnYWZ0ZXJPZiddLmZvckVhY2goZmxpcCk7XG5cbmZ1bmN0aW9uIGZsaXAgKGtleSkge1xuICB2YXIgb3JpZ2luYWwgPSBrZXkuc3BsaXQoL1tBLVpdLylbMF07XG4gIGFwaVtrZXldID0gZnVuY3Rpb24gKGVsLCB0YXJnZXQpIHtcbiAgICBhcGlbb3JpZ2luYWxdKHRhcmdldCwgZWwpO1xuICB9O1xufVxuXG52YXIgbnVtZXJpY0Nzc1Byb3BlcnRpZXMgPSB7XG4gICdjb2x1bW4tY291bnQnOiB0cnVlLFxuICAnZmlsbC1vcGFjaXR5JzogdHJ1ZSxcbiAgJ2ZsZXgtZ3Jvdyc6IHRydWUsXG4gICdmbGV4LXNocmluayc6IHRydWUsXG4gICdmb250LXdlaWdodCc6IHRydWUsXG4gICdsaW5lLWhlaWdodCc6IHRydWUsXG4gICdvcGFjaXR5JzogdHJ1ZSxcbiAgJ29yZGVyJzogdHJ1ZSxcbiAgJ29ycGhhbnMnOiB0cnVlLFxuICAnd2lkb3dzJzogdHJ1ZSxcbiAgJ3otaW5kZXgnOiB0cnVlLFxuICAnem9vbSc6IHRydWVcbn07XG52YXIgbnVtZXJpYyA9IC9eXFxkKyQvO1xudmFyIGNhbkZsb2F0ID0gJ2Zsb2F0JyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG5hcGkuZ2V0Q3NzID0gZnVuY3Rpb24gKGVsLCBwcm9wKSB7XG4gIGlmICghdGVzdC5pc0VsZW1lbnQoZWwpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGhwcm9wID0gdGV4dC5oeXBoZW5hdGUocHJvcCk7XG4gIHZhciBmcHJvcCA9ICFjYW5GbG9hdCAmJiBocHJvcCA9PT0gJ2Zsb2F0JyA/ICdjc3NGbG9hdCcgOiBocHJvcDtcbiAgdmFyIHJlc3VsdCA9IGdsb2JhbC5nZXRDb21wdXRlZFN0eWxlKGVsKVtocHJvcF07XG4gIGlmIChwcm9wID09PSAnb3BhY2l0eScgJiYgcmVzdWx0ID09PSAnJykge1xuICAgIHJldHVybiAxO1xuICB9XG4gIGlmIChyZXN1bHQuc3Vic3RyKC0yKSA9PT0gJ3B4JyB8fCBudW1lcmljLnRlc3QocmVzdWx0KSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHJlc3VsdCwgMTApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5hcGkuc2V0Q3NzID0gZnVuY3Rpb24gKHByb3BzKSB7XG4gIHZhciBtYXBwZWQgPSBPYmplY3Qua2V5cyhwcm9wcykuZmlsdGVyKGJhZCkubWFwKGV4cGFuZCk7XG4gIGZ1bmN0aW9uIGJhZCAocHJvcCkge1xuICAgIHZhciB2YWx1ZSA9IHByb3BzW3Byb3BdO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSA9PT0gdmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gZXhwYW5kIChwcm9wKSB7XG4gICAgdmFyIGhwcm9wID0gdGV4dC5oeXBoZW5hdGUocHJvcCk7XG4gICAgdmFyIHZhbHVlID0gcHJvcHNbcHJvcF07XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIW51bWVyaWNDc3NQcm9wZXJ0aWVzW2hwcm9wXSkge1xuICAgICAgdmFsdWUgKz0gJ3B4JztcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGhwcm9wLCB2YWx1ZTogdmFsdWVcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoZWwpIHtcbiAgICBpZiAoIXRlc3QuaXNFbGVtZW50KGVsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtYXBwZWQuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgZWwuc3R5bGVbcHJvcC5uYW1lXSA9IHByb3AudmFsdWU7XG4gICAgfSk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vRG9taW51cy5wcm90b3R5cGUnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xuXG5mdW5jdGlvbiBmbGF0dGVuIChhLCBjYWNoZSkge1xuICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKGN1cnJlbnQsIGl0ZW0pIHtcbiAgICBpZiAoRG9taW51cy5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICByZXR1cm4gZmxhdHRlbihpdGVtLCBjdXJyZW50KTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBjdXJyZW50LmNvbmNhdChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH0sIGNhY2hlIHx8IG5ldyBEb21pbnVzKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZsYXR0ZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbScpO1xudmFyIGNhc3QgPSByZXF1aXJlKCcuL2Nhc3QnKTtcbnZhciBjdXN0b20gPSByZXF1aXJlKCcuL2N1c3RvbScpO1xudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xudmFyIHRhZyA9IC9eXFxzKjwoW2Etel0rKD86LVthLXpdKyk/KVxccypcXC8/PlxccyokL2k7XG5cbmZ1bmN0aW9uIGFwaSAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIG5vdFRleHQgPSB0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnO1xuICBpZiAobm90VGV4dCAmJiBhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBjYXN0KHNlbGVjdG9yKTtcbiAgfVxuICBpZiAobm90VGV4dCkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIHZhciBtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2godGFnKTtcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICByZXR1cm4gZG9tLm1ha2UobWF0Y2hlc1sxXSk7XG4gIH1cbiAgcmV0dXJuIGFwaS5maW5kKHNlbGVjdG9yLCBjb250ZXh0KTtcbn1cblxuYXBpLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGRvbS5xc2EoY29udGV4dCwgc2VsZWN0b3IpO1xufTtcblxuYXBpLmZpbmRPbmUgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGRvbS5xcyhjb250ZXh0LCBzZWxlY3Rvcik7XG59O1xuXG5hcGkuY3VzdG9tID0gY3VzdG9tLnJlZ2lzdGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVsZW1lbnRPYmplY3RzID0gdHlwZW9mIEhUTUxFbGVtZW50ID09PSAnb2JqZWN0JztcblxuZnVuY3Rpb24gaXNFbGVtZW50IChvKSB7XG4gIHJldHVybiBlbGVtZW50T2JqZWN0cyA/IG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IGlzRWxlbWVudE9iamVjdChvKTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50T2JqZWN0IChvKSB7XG4gIHJldHVybiBvICYmXG4gICAgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG8ubm9kZU5hbWUgPT09ICdzdHJpbmcnICYmXG4gICAgby5ub2RlVHlwZSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoYSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBpc0NoZWNrYWJsZSAoZWxlbSkge1xuICByZXR1cm4gJ2NoZWNrZWQnIGluIGVsZW0gJiYgZWxlbS50eXBlID09PSAncmFkaW8nIHx8IGVsZW0udHlwZSA9PT0gJ2NoZWNrYm94Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRWxlbWVudDogaXNFbGVtZW50LFxuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0NoZWNrYWJsZTogaXNDaGVja2FibGVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGh5cGhlblRvQ2FtZWwgKGh5cGhlbnMpIHtcbiAgdmFyIHBhcnQgPSAvLShbYS16XSkvZztcbiAgcmV0dXJuIGh5cGhlbnMucmVwbGFjZShwYXJ0LCBmdW5jdGlvbiAoZywgbSkge1xuICAgIHJldHVybiBtLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoeXBoZW5hdGUgKHRleHQpIHtcbiAgdmFyIGNhbWVsID0gLyhbYS16XSkoW0EtWl0pL2c7XG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoY2FtZWwsICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBoeXBoZW5Ub0NhbWVsOiBoeXBoZW5Ub0NhbWVsLFxuICBoeXBoZW5hdGU6IGh5cGhlbmF0ZVxufTtcbiJdfQ==
