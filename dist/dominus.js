/**
 * dominus - Lean DOM Manipulation
 * @version v5.0.0
 * @link https://github.com/bevacqua/dominus
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.dominus=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';

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

function fabricateEvent (el, type) {
  var e;
  if (doc.createEvent) {
    e = doc.createEvent('Event');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  } else if (doc.createEventObject) {
    e = doc.createEventObject();
    el.fireEvent('on' + type, e);
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault  = e.preventDefault  || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
var poser = _dereq_('./src/node');

module.exports = poser;

['Array', 'Function', 'Object', 'Date', 'String'].forEach(pose);

function pose (type) {
  poser[type] = function poseComputedType () { return poser(type); };
}

},{"./src/node":3}],3:[function(_dereq_,module,exports){
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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
(function (global){
'use strict';

var expando = 'sektor-' + Date.now();
var rsiblings = /[+~]/;
var document = global.document;
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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(_dereq_,module,exports){
'use strict';

var poser = _dereq_('poser');
var Dominus = poser.Array();

module.exports = Dominus;

},{"poser":2}],6:[function(_dereq_,module,exports){
'use strict';

var $ = _dereq_('./public');
var flatten = _dereq_('./flatten');
var dom = _dereq_('./dom');
var custom = _dereq_('./custom');
var classes = _dereq_('./classes');
var Dominus = _dereq_('./Dominus.ctor');

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

module.exports = _dereq_('./public');

},{"./Dominus.ctor":5,"./classes":9,"./custom":10,"./dom":11,"./flatten":13,"./public":14}],7:[function(_dereq_,module,exports){
'use strict';

var Dominus = _dereq_('./Dominus.ctor');
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

},{"./Dominus.ctor":5}],8:[function(_dereq_,module,exports){
(function (global){
'use strict';

var test = _dereq_('./test');
var apply = _dereq_('./apply');
var Dominus = _dereq_('./Dominus.ctor');

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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Dominus.ctor":5,"./apply":7,"./test":15}],9:[function(_dereq_,module,exports){
'use strict';

var trim = /^\s+|\s+$/g;
var whitespace = /\s+/g;
var test = _dereq_('./test');

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

},{"./test":15}],10:[function(_dereq_,module,exports){
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

},{}],11:[function(_dereq_,module,exports){
(function (global){
'use strict';

var sektor = _dereq_('sektor');
var crossvent = _dereq_('crossvent');
var Dominus = _dereq_('./Dominus.ctor');
var cast = _dereq_('./cast');
var apply = _dereq_('./apply');
var text = _dereq_('./text');
var test = _dereq_('./test');
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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Dominus.ctor":5,"./apply":7,"./cast":8,"./test":15,"./text":16,"crossvent":1,"sektor":4}],12:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./Dominus.prototype');

},{"./Dominus.prototype":6}],13:[function(_dereq_,module,exports){
'use strict';

var Dominus = _dereq_('./Dominus.ctor');

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

},{"./Dominus.ctor":5}],14:[function(_dereq_,module,exports){
'use strict';

var dom = _dereq_('./dom');
var cast = _dereq_('./cast');
var custom = _dereq_('./custom');
var Dominus = _dereq_('./Dominus.ctor');
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

},{"./Dominus.ctor":5,"./cast":8,"./custom":10,"./dom":11}],15:[function(_dereq_,module,exports){
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

},{}],16:[function(_dereq_,module,exports){
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

},{}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9jcm9zc3ZlbnQuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvcG9zZXIvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvcG9zZXIvc3JjL2Jyb3dzZXIuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvc2VrdG9yL3NyYy9zZWt0b3IuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvRG9taW51cy5jdG9yLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL0RvbWludXMucHJvdG90eXBlLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL2FwcGx5LmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL2Nhc3QuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvY2xhc3Nlcy5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL3NyYy9jdXN0b20uanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvZG9tLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL2RvbWludXMuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvZmxhdHRlbi5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL3NyYy9wdWJsaWMuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvdGVzdC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL3NyYy90ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdWQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcbnZhciBoYXJkQ2FjaGUgPSBbXTtcblxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgd3JhcChlbCwgdHlwZSwgZm4pKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgcmV0dXJuIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCB1bndyYXAoZWwsIHR5cGUsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIGZhYnJpY2F0ZUV2ZW50IChlbCwgdHlwZSkge1xuICB2YXIgZTtcbiAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xuICAgIGUgPSBkb2MuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZS5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChlKTtcbiAgfSBlbHNlIGlmIChkb2MuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICBlID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgZWwuZmlyZUV2ZW50KCdvbicgKyB0eXBlLCBlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cmFwcGVyRmFjdG9yeSAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVyIChvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSBvcmlnaW5hbEV2ZW50IHx8IGdsb2JhbC5ldmVudDtcbiAgICBlLnRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLnByZXZlbnREZWZhdWx0ICA9IGUucHJldmVudERlZmF1bHQgIHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICgpIHsgZS5jYW5jZWxCdWJibGUgPSB0cnVlOyB9O1xuICAgIGZuLmNhbGwoZWwsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIHdyYXBwZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbCwgdHlwZSwgZm4pO1xuICBoYXJkQ2FjaGUucHVzaCh7XG4gICAgd3JhcHBlcjogd3JhcHBlcixcbiAgICBlbGVtZW50OiBlbCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGZuOiBmblxuICB9KTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHVud3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGksIGl0ZW07XG4gIGZvciAoaSA9IDA7IGkgPCBoYXJkQ2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICBpdGVtID0gaGFyZENhY2hlW2ldO1xuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50LFxuICBmYWJyaWNhdGU6IGZhYnJpY2F0ZUV2ZW50XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsInZhciBwb3NlciA9IHJlcXVpcmUoJy4vc3JjL25vZGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NlcjtcblxuWydBcnJheScsICdGdW5jdGlvbicsICdPYmplY3QnLCAnRGF0ZScsICdTdHJpbmcnXS5mb3JFYWNoKHBvc2UpO1xuXG5mdW5jdGlvbiBwb3NlICh0eXBlKSB7XG4gIHBvc2VyW3R5cGVdID0gZnVuY3Rpb24gcG9zZUNvbXB1dGVkVHlwZSAoKSB7IHJldHVybiBwb3Nlcih0eXBlKTsgfTtcbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGQgPSBnbG9iYWwuZG9jdW1lbnQ7XG5cbmZ1bmN0aW9uIHBvc2VyICh0eXBlKSB7XG4gIHZhciBpZnJhbWUgPSBkLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuXG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkLmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuICByZXR1cm4gbWFwKHR5cGUsIGlmcmFtZS5jb250ZW50V2luZG93KTtcbn1cblxuZnVuY3Rpb24gbWFwICh0eXBlLCBzb3VyY2UpIHsgLy8gZm9yd2FyZCBwb2x5ZmlsbHMgdG8gdGhlIHN0b2xlbiByZWZlcmVuY2UhXG4gIHZhciBvcmlnaW5hbCA9IHdpbmRvd1t0eXBlXS5wcm90b3R5cGU7XG4gIHZhciB2YWx1ZSA9IHNvdXJjZVt0eXBlXTtcbiAgdmFyIHByb3A7XG5cbiAgZm9yIChwcm9wIGluIG9yaWdpbmFsKSB7XG4gICAgdmFsdWUucHJvdG90eXBlW3Byb3BdID0gb3JpZ2luYWxbcHJvcF07XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zZXI7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXhwYW5kbyA9ICdzZWt0b3ItJyArIERhdGUubm93KCk7XG52YXIgcnNpYmxpbmdzID0gL1srfl0vO1xudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIGRlbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciBtYXRjaCA9IGRlbC5tYXRjaGVzIHx8XG4gICAgICAgICAgICBkZWwud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICBkZWwubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICBkZWwub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgZGVsLm1zTWF0Y2hlc1NlbGVjdG9yO1xuXG5mdW5jdGlvbiBxc2EgKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gIHZhciBleGlzdGVkLCBpZCwgcHJlZml4LCBwcmVmaXhlZCwgYWRhcHRlciwgaGFjayA9IGNvbnRleHQgIT09IGRvY3VtZW50O1xuICBpZiAoaGFjaykgeyAvLyBpZCBoYWNrIGZvciBjb250ZXh0LXJvb3RlZCBxdWVyaWVzXG4gICAgZXhpc3RlZCA9IGNvbnRleHQuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgIGlkID0gZXhpc3RlZCB8fCBleHBhbmRvO1xuICAgIHByZWZpeCA9ICcjJyArIGlkICsgJyAnO1xuICAgIHByZWZpeGVkID0gcHJlZml4ICsgc2VsZWN0b3IucmVwbGFjZSgvLC9nLCAnLCcgKyBwcmVmaXgpO1xuICAgIGFkYXB0ZXIgPSByc2libGluZ3MudGVzdChzZWxlY3RvcikgJiYgY29udGV4dC5wYXJlbnROb2RlO1xuICAgIGlmICghZXhpc3RlZCkgeyBjb250ZXh0LnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7IH1cbiAgfVxuICB0cnkge1xuICAgIHJldHVybiAoYWRhcHRlciB8fCBjb250ZXh0KS5xdWVyeVNlbGVjdG9yQWxsKHByZWZpeGVkIHx8IHNlbGVjdG9yKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBbXTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoZXhpc3RlZCA9PT0gbnVsbCkgeyBjb250ZXh0LnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTsgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmQgKHNlbGVjdG9yLCBjdHgsIGNvbGxlY3Rpb24sIHNlZWQpIHtcbiAgdmFyIGVsZW1lbnQ7XG4gIHZhciBjb250ZXh0ID0gY3R4IHx8IGRvY3VtZW50O1xuICB2YXIgcmVzdWx0cyA9IGNvbGxlY3Rpb24gfHwgW107XG4gIHZhciBpID0gMDtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuICBpZiAoY29udGV4dC5ub2RlVHlwZSAhPT0gMSAmJiBjb250ZXh0Lm5vZGVUeXBlICE9PSA5KSB7XG4gICAgcmV0dXJuIFtdOyAvLyBiYWlsIGlmIGNvbnRleHQgaXMgbm90IGFuIGVsZW1lbnQgb3IgZG9jdW1lbnRcbiAgfVxuICBpZiAoc2VlZCkge1xuICAgIHdoaWxlICgoZWxlbWVudCA9IHNlZWRbaSsrXSkpIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0cy5wdXNoLmFwcGx5KHJlc3VsdHMsIHFzYShzZWxlY3RvciwgY29udGV4dCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzIChzZWxlY3RvciwgZWxlbWVudHMpIHtcbiAgcmV0dXJuIGZpbmQoc2VsZWN0b3IsIG51bGwsIG51bGwsIGVsZW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yIChlbGVtZW50LCBzZWxlY3Rvcikge1xuICByZXR1cm4gbWF0Y2guY2FsbChlbGVtZW50LCBzZWxlY3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmluZDtcblxuZmluZC5tYXRjaGVzID0gbWF0Y2hlcztcbmZpbmQubWF0Y2hlc1NlbGVjdG9yID0gbWF0Y2hlc1NlbGVjdG9yO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBvc2VyID0gcmVxdWlyZSgncG9zZXInKTtcbnZhciBEb21pbnVzID0gcG9zZXIuQXJyYXkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEb21pbnVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJy4vcHVibGljJyk7XG52YXIgZmxhdHRlbiA9IHJlcXVpcmUoJy4vZmxhdHRlbicpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4vZG9tJyk7XG52YXIgY3VzdG9tID0gcmVxdWlyZSgnLi9jdXN0b20nKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnLi9jbGFzc2VzJyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG5cbmZ1bmN0aW9uIGVxdWFscyAoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVxdWFscyAoZWxlbSkge1xuICAgIHJldHVybiBkb20ubWF0Y2hlcyhlbGVtLCBzZWxlY3Rvcik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0cmFpZ2h0IChwcm9wLCBvbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRvbU1hcHBpbmcgKHNlbGVjdG9yKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMubWFwKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICByZXR1cm4gZG9tW3Byb3BdKGVsZW0sIHNlbGVjdG9yKTtcbiAgICB9KTtcbiAgICB2YXIgcmVzdWx0cyA9IGZsYXR0ZW4ocmVzdWx0KTtcbiAgICByZXR1cm4gb25lID8gcmVzdWx0c1swXSA6IHJlc3VsdHM7XG4gIH07XG59XG5cbkRvbWludXMucHJvdG90eXBlLnByZXYgPSBzdHJhaWdodCgncHJldicpO1xuRG9taW51cy5wcm90b3R5cGUubmV4dCA9IHN0cmFpZ2h0KCduZXh0Jyk7XG5Eb21pbnVzLnByb3RvdHlwZS5wYXJlbnQgPSBzdHJhaWdodCgncGFyZW50Jyk7XG5Eb21pbnVzLnByb3RvdHlwZS5wYXJlbnRzID0gc3RyYWlnaHQoJ3BhcmVudHMnKTtcbkRvbWludXMucHJvdG90eXBlLmNoaWxkcmVuID0gc3RyYWlnaHQoJ2NoaWxkcmVuJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5maW5kID0gc3RyYWlnaHQoJ3FzYScpO1xuRG9taW51cy5wcm90b3R5cGUuZmluZE9uZSA9IHN0cmFpZ2h0KCdxcycsIHRydWUpO1xuXG5Eb21pbnVzLnByb3RvdHlwZS53aGVyZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICByZXR1cm4gdGhpcy5maWx0ZXIoZXF1YWxzKHNlbGVjdG9yKSk7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICByZXR1cm4gdGhpcy5zb21lKGVxdWFscyhzZWxlY3RvcikpO1xufTtcblxuRG9taW51cy5wcm90b3R5cGUuaSA9IGZ1bmN0aW9uIChpbmRleCkge1xuICByZXR1cm4gdGhpc1tpbmRleF0gPyBuZXcgRG9taW51cyh0aGlzW2luZGV4XSkgOiBuZXcgRG9taW51cygpO1xufTtcblxuZnVuY3Rpb24gY29tcGFyZUZhY3RvcnkgKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjb21wYXJlICgpIHtcbiAgICAkLmFwcGx5KG51bGwsIGFyZ3VtZW50cykuZm9yRWFjaChmbiwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbkRvbWludXMucHJvdG90eXBlLmFuZCA9IGNvbXBhcmVGYWN0b3J5KGZ1bmN0aW9uIGFkZE9uZSAoZWxlbSkge1xuICBpZiAodGhpcy5pbmRleE9mKGVsZW0pID09PSAtMSkge1xuICAgIHRoaXMucHVzaChlbGVtKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn0pO1xuXG5Eb21pbnVzLnByb3RvdHlwZS5idXQgPSBjb21wYXJlRmFjdG9yeShmdW5jdGlvbiBhZGRPbmUgKGVsZW0pIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGVsZW0pO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufSk7XG5cbkRvbWludXMucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICB2YXIgcHJvcHM7XG4gIHZhciBtYW55ID0gbmFtZSAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCc7XG4gIHZhciBnZXR0ZXIgPSAhbWFueSAmJiAhdmFsdWU7XG4gIGlmIChnZXR0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPyBkb20uZ2V0Q3NzKHRoaXNbMF0sIG5hbWUpIDogbnVsbDtcbiAgfVxuICBpZiAobWFueSkge1xuICAgIHByb3BzID0gbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBwcm9wcyA9IHt9O1xuICAgIHByb3BzW25hbWVdID0gdmFsdWU7XG4gIH1cbiAgdGhpcy5mb3JFYWNoKGRvbS5zZXRDc3MocHJvcHMpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBldmVudGVyIChtZXRob2QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlcywgZmlsdGVyLCBmbikge1xuICAgIHZhciB0eXBlbGlzdCA9IHR5cGVzLnNwbGl0KCcgJyk7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4gPSBmaWx0ZXI7XG4gICAgICBmaWx0ZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHR5cGVsaXN0LmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBjdXN0b20uaGFuZGxlcnNbdHlwZV07XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgZG9tW21ldGhvZF0oZWxlbSwgaGFuZGxlci5ldmVudCwgZmlsdGVyLCBoYW5kbGVyLndyYXAoZm4pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb21bbWV0aG9kXShlbGVtLCB0eXBlLCBmaWx0ZXIsIGZuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbkRvbWludXMucHJvdG90eXBlLm9uY2UgPSBldmVudGVyKCdvbmNlJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5vbiA9IGV2ZW50ZXIoJ29uJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5vZmYgPSBldmVudGVyKCdvZmYnKTtcbkRvbWludXMucHJvdG90eXBlLmVtaXQgPSBldmVudGVyKCdlbWl0Jyk7XG5cbltcbiAgWydhZGRDbGFzcycsIGNsYXNzZXMuYWRkXSxcbiAgWydyZW1vdmVDbGFzcycsIGNsYXNzZXMucmVtb3ZlXSxcbiAgWydzZXRDbGFzcycsIGNsYXNzZXMuc2V0XSxcbiAgWydyZW1vdmVDbGFzcycsIGNsYXNzZXMucmVtb3ZlXSxcbiAgWydyZW1vdmUnLCBkb20ucmVtb3ZlXVxuXS5mb3JFYWNoKG1hcE1ldGhvZHMpO1xuXG5mdW5jdGlvbiBtYXBNZXRob2RzIChkYXRhKSB7XG4gIERvbWludXMucHJvdG90eXBlW2RhdGFbMF1dID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICBkYXRhWzFdKGVsZW0sIHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn1cblxuW1xuICAnYXBwZW5kJyxcbiAgJ2FwcGVuZFRvJyxcbiAgJ3ByZXBlbmQnLFxuICAncHJlcGVuZFRvJyxcbiAgJ2JlZm9yZScsXG4gICdiZWZvcmVPZicsXG4gICdhZnRlcicsXG4gICdhZnRlck9mJ1xuXS5mb3JFYWNoKG1hcE1hbmlwdWxhdGlvbik7XG5cbmZ1bmN0aW9uIG1hcE1hbmlwdWxhdGlvbiAobWV0aG9kKSB7XG4gIERvbWludXMucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBkb21bbWV0aG9kXSh0aGlzLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbkRvbWludXMucHJvdG90eXBlLmhhc0NsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICByZXR1cm4gY2xhc3Nlcy5jb250YWlucyhlbGVtLCB2YWx1ZSk7XG4gIH0pO1xufTtcblxuRG9taW51cy5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICB2YXIgaGFzaCA9IG5hbWUgJiYgdHlwZW9mIG5hbWUgPT09ICdvYmplY3QnO1xuICB2YXIgc2V0ID0gaGFzaCA/IHNldE1hbnkgOiBzZXRTaW5nbGU7XG4gIHZhciBzZXR0ZXIgPSBoYXNoIHx8IGFyZ3VtZW50cy5sZW5ndGggPiAxO1xuICBpZiAoc2V0dGVyKSB7XG4gICAgdGhpcy5mb3JFYWNoKHNldCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID8gZG9tLmdldEF0dHIodGhpc1swXSwgbmFtZSkgOiBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIHNldE1hbnkgKGVsZW0pIHtcbiAgICBkb20ubWFueUF0dHIoZWxlbSwgbmFtZSk7XG4gIH1cbiAgZnVuY3Rpb24gc2V0U2luZ2xlIChlbGVtKSB7XG4gICAgZG9tLmF0dHIoZWxlbSwgbmFtZSwgdmFsdWUpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBrZXlWYWx1ZSAoa2V5LCB2YWx1ZSkge1xuICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDI7XG4gIGlmIChnZXR0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPyBkb21ba2V5XSh0aGlzWzBdKSA6ICcnO1xuICB9XG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xuICAgIGRvbVtrZXldKGVsZW0sIHZhbHVlKTtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5mdW5jdGlvbiBrZXlWYWx1ZVByb3BlcnR5IChwcm9wKSB7XG4gIERvbWludXMucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24gYWNjZXNzb3IgKHZhbHVlKSB7XG4gICAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAxO1xuICAgIGlmIChnZXR0ZXIpIHtcbiAgICAgIHJldHVybiBrZXlWYWx1ZS5jYWxsKHRoaXMsIHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4ga2V5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCB2YWx1ZSk7XG4gIH07XG59XG5cblsnaHRtbCcsICd0ZXh0JywgJ3ZhbHVlJ10uZm9yRWFjaChrZXlWYWx1ZVByb3BlcnR5KTtcblxuRG9taW51cy5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoZWxlbSkge1xuICAgIHJldHVybiBkb20uY2xvbmUoZWxlbSk7XG4gIH0pO1xufTtcblxuRG9taW51cy5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmxlbmd0aCkge1xuICAgIHRoaXNbMF0uZm9jdXMoKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9wdWJsaWMnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xudmFyIHByb3RvID0gRG9taW51cy5wcm90b3R5cGU7XG5cbmZ1bmN0aW9uIEFwcGxpZWQgKGFyZ3MpIHtcbiAgcmV0dXJuIERvbWludXMuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbkFwcGxpZWQucHJvdG90eXBlID0gcHJvdG87XG5cbmZ1bmN0aW9uIGFwcGx5IChhKSB7XG4gIHJldHVybiBuZXcgQXBwbGllZChhKTtcbn1cblxuWydtYXAnLCAnZmlsdGVyJywgJ2NvbmNhdCcsICdzbGljZSddLmZvckVhY2goZW5zdXJlKTtcblxuZnVuY3Rpb24gZW5zdXJlIChrZXkpIHtcbiAgdmFyIG9yaWdpbmFsID0gcHJvdG9ba2V5XTtcbiAgcHJvdG9ba2V5XSA9IGZ1bmN0aW9uIGFwcGxpZWQgKCkge1xuICAgIHJldHVybiBhcHBseShvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcbnZhciBhcHBseSA9IHJlcXVpcmUoJy4vYXBwbHknKTtcbnZhciBEb21pbnVzID0gcmVxdWlyZSgnLi9Eb21pbnVzLmN0b3InKTtcblxuZnVuY3Rpb24gY2FzdCAoYSkge1xuICBpZiAoYSA9PT0gZ2xvYmFsKSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKGEpO1xuICB9XG4gIGlmIChhIGluc3RhbmNlb2YgRG9taW51cykge1xuICAgIHJldHVybiBhO1xuICB9XG4gIGlmICghYSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIGlmICh0ZXN0LmlzRWxlbWVudChhKSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cyhhKTtcbiAgfVxuICBpZiAoIXRlc3QuaXNBcnJheShhKSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIHJldHVybiBhcHBseShhKS5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcbiAgICByZXR1cm4gdGVzdC5pc0VsZW1lbnQoaSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhc3Q7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xudmFyIHdoaXRlc3BhY2UgPSAvXFxzKy9nO1xudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcblxuZnVuY3Rpb24gaW50ZXJwcmV0IChpbnB1dCkge1xuICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/IGlucHV0LnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpIDogaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZXMgKGVsKSB7XG4gIGlmICh0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm4gZWwuY2xhc3NOYW1lLnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gc2V0IChlbCwgaW5wdXQpIHtcbiAgaWYgKHRlc3QuaXNFbGVtZW50KGVsKSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IGludGVycHJldChpbnB1dCkuam9pbignICcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZCAoZWwsIGlucHV0KSB7XG4gIHZhciBjdXJyZW50ID0gcmVtb3ZlKGVsLCBpbnB1dCk7XG4gIHZhciB2YWx1ZXMgPSBpbnRlcnByZXQoaW5wdXQpO1xuICBjdXJyZW50LnB1c2guYXBwbHkoY3VycmVudCwgdmFsdWVzKTtcbiAgc2V0KGVsLCBjdXJyZW50KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoZWwsIGlucHV0KSB7XG4gIHZhciBjdXJyZW50ID0gY2xhc3NlcyhlbCk7XG4gIHZhciB2YWx1ZXMgPSBpbnRlcnByZXQoaW5wdXQpO1xuICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgaSA9IGN1cnJlbnQuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICBjdXJyZW50LnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH0pO1xuICBzZXQoZWwsIGN1cnJlbnQpO1xuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gY29udGFpbnMgKGVsLCBpbnB1dCkge1xuICB2YXIgY3VycmVudCA9IGNsYXNzZXMoZWwpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcblxuICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBjdXJyZW50LmluZGV4T2YodmFsdWUpICE9PSAtMTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZCxcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIGNvbnRhaW5zOiBjb250YWlucyxcbiAgc2V0OiBzZXQsXG4gIGdldDogY2xhc3Nlc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhbmRsZXJzID0ge307XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyIChuYW1lLCB0eXBlLCBmaWx0ZXIpIHtcbiAgaGFuZGxlcnNbbmFtZV0gPSB7XG4gICAgZXZlbnQ6IHR5cGUsXG4gICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgd3JhcDogd3JhcFxuICB9O1xuXG4gIGZ1bmN0aW9uIHdyYXAgKGZuKSB7XG4gICAgcmV0dXJuIHdyYXBwZXIobmFtZSwgZm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZXIgKG5hbWUsIGZuKSB7XG4gIGlmICghZm4pIHtcbiAgICByZXR1cm4gZm47XG4gIH1cbiAgdmFyIGtleSA9ICdfX2RjZV8nICsgbmFtZTtcbiAgaWYgKGZuW2tleV0pIHtcbiAgICByZXR1cm4gZm5ba2V5XTtcbiAgfVxuICBmbltrZXldID0gZnVuY3Rpb24gY3VzdG9tRXZlbnQgKGUpIHtcbiAgICB2YXIgbWF0Y2ggPSBoYW5kbGVyc1tuYW1lXS5maWx0ZXIoZSk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmbltrZXldO1xufVxuXG5yZWdpc3RlcignbGVmdC1jbGljaycsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIHJldHVybiBlLndoaWNoID09PSAxICYmICFlLm1ldGFLZXkgJiYgIWUuY3RybEtleTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICB3cmFwcGVyOiB3cmFwcGVyLFxuICBoYW5kbGVyczogaGFuZGxlcnNcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBzZWt0b3IgPSByZXF1aXJlKCdzZWt0b3InKTtcbnZhciBjcm9zc3ZlbnQgPSByZXF1aXJlKCdjcm9zc3ZlbnQnKTtcbnZhciBEb21pbnVzID0gcmVxdWlyZSgnLi9Eb21pbnVzLmN0b3InKTtcbnZhciBjYXN0ID0gcmVxdWlyZSgnLi9jYXN0Jyk7XG52YXIgYXBwbHkgPSByZXF1aXJlKCcuL2FwcGx5Jyk7XG52YXIgdGV4dCA9IHJlcXVpcmUoJy4vdGV4dCcpO1xudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcbnZhciBhcGkgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIGRlbGVnYXRlcyA9IHt9O1xuXG5mdW5jdGlvbiBjYXN0Q29udGV4dCAoY29udGV4dCkge1xuICBpZiAodHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGFwaS5xcyhudWxsLCBjb250ZXh0KTtcbiAgfVxuICBpZiAodGVzdC5pc0VsZW1lbnQoY29udGV4dCkpIHtcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gY29udGV4dFswXTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuYXBpLnFzYSA9IGZ1bmN0aW9uIChlbCwgc2VsZWN0b3IpIHtcbiAgdmFyIHJlc3VsdHMgPSBuZXcgRG9taW51cygpO1xuICByZXR1cm4gc2VrdG9yKHNlbGVjdG9yLCBjYXN0Q29udGV4dChlbCksIHJlc3VsdHMpO1xufTtcblxuYXBpLnFzID0gZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xuICByZXR1cm4gYXBpLnFzYShlbCwgc2VsZWN0b3IpWzBdO1xufTtcblxuYXBpLm1hdGNoZXMgPSBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XG4gIHJldHVybiB0ZXN0LmlzRWxlbWVudChlbCkgJiYgc2VrdG9yLm1hdGNoZXNTZWxlY3RvcihlbCwgc2VsZWN0b3IpO1xufTtcblxuZnVuY3Rpb24gcmVsYXRlZEZhY3RvcnkgKHByb3ApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlbGF0ZWQgKGVsLCBzZWxlY3Rvcikge1xuICAgIHZhciByZWxhdGl2ZSA9IGVsW3Byb3BdO1xuICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgaWYgKCFzZWxlY3RvciB8fCBhcGkubWF0Y2hlcyhyZWxhdGl2ZSwgc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBjYXN0KHJlbGF0aXZlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH07XG59XG5cbmFwaS5wcmV2ID0gcmVsYXRlZEZhY3RvcnkoJ3ByZXZpb3VzRWxlbWVudFNpYmxpbmcnKTtcbmFwaS5uZXh0ID0gcmVsYXRlZEZhY3RvcnkoJ25leHRFbGVtZW50U2libGluZycpO1xuYXBpLnBhcmVudCA9IHJlbGF0ZWRGYWN0b3J5KCdwYXJlbnRFbGVtZW50Jyk7XG5cbmZ1bmN0aW9uIG1hdGNoZXMgKGVsLCB2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRG9taW51cykge1xuICAgIHJldHVybiB2YWx1ZS5pbmRleE9mKGVsKSAhPT0gLTE7XG4gIH1cbiAgaWYgKHRlc3QuaXNFbGVtZW50KHZhbHVlKSkge1xuICAgIHJldHVybiBlbCA9PT0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGFwaS5tYXRjaGVzKGVsLCB2YWx1ZSk7XG59XG5cbmFwaS5wYXJlbnRzID0gZnVuY3Rpb24gKGVsLCB2YWx1ZSkge1xuICB2YXIgZWxlbWVudHMgPSBbXTtcbiAgdmFyIGN1cnJlbnQgPSBlbDtcbiAgd2hpbGUgKGN1cnJlbnQucGFyZW50RWxlbWVudCkge1xuICAgIGlmIChtYXRjaGVzKGN1cnJlbnQucGFyZW50RWxlbWVudCwgdmFsdWUpKSB7XG4gICAgICBlbGVtZW50cy5wdXNoKGN1cnJlbnQucGFyZW50RWxlbWVudCk7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGFwcGx5KGVsZW1lbnRzKTtcbn07XG5cbmFwaS5jaGlsZHJlbiA9IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcbiAgdmFyIGVsZW1lbnRzID0gW107XG4gIHZhciBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuO1xuICB2YXIgY2hpbGQ7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBjaGlsZHJlbiAmJiBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIGlmIChtYXRjaGVzKGNoaWxkLCB2YWx1ZSkpIHtcbiAgICAgIGVsZW1lbnRzLnB1c2goY2hpbGQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXBwbHkoZWxlbWVudHMpO1xufTtcblxuLy8gdGhpcyBtZXRob2QgY2FjaGVzIGRlbGVnYXRlcyBzbyB0aGF0IC5vZmYoKSB3b3JrcyBzZWFtbGVzc2x5XG5mdW5jdGlvbiBkZWxlZ2F0ZSAocm9vdCwgZmlsdGVyLCBmbikge1xuICBpZiAoZGVsZWdhdGVzW2ZuLl9kZF0pIHtcbiAgICByZXR1cm4gZGVsZWdhdGVzW2ZuLl9kZF07XG4gIH1cbiAgZm4uX2RkID0gRGF0ZS5ub3coKTtcbiAgZGVsZWdhdGVzW2ZuLl9kZF0gPSBkZWxlZ2F0b3I7XG4gIGZ1bmN0aW9uIGRlbGVnYXRvciAoZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiBlbCAhPT0gcm9vdCkge1xuICAgICAgaWYgKGFwaS5tYXRjaGVzKGVsLCBmaWx0ZXIpKSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlbGVnYXRvcjtcbn1cblxuZnVuY3Rpb24gZXZlbnRlZCAobWV0aG9kLCBlbCwgdHlwZSwgZmlsdGVyLCBmbikge1xuICBpZiAoZmlsdGVyID09PSBudWxsKSB7XG4gICAgY3Jvc3N2ZW50W21ldGhvZF0oZWwsIHR5cGUsIGZuKTtcbiAgfSBlbHNlIHtcbiAgICBjcm9zc3ZlbnRbbWV0aG9kXShlbCwgdHlwZSwgZGVsZWdhdGUoZWwsIGZpbHRlciwgZm4pKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbmNlIChlbCwgdHlwZSwgZmlsdGVyLCBmbikge1xuICB2YXIgdGhpbmdzID0gW2VsLCB0eXBlLCBmaWx0ZXIsIGRpc3Bvc2FibGVdO1xuICBhcGkub24uYXBwbHkoYXBpLCB0aGluZ3MpO1xuICBmdW5jdGlvbiBkaXNwb3NhYmxlICgpIHtcbiAgICBhcGkub2ZmLmFwcGx5KGFwaSwgdGhpbmdzKTtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5hcGkub25jZSA9IG9uY2U7XG5hcGkub24gPSBldmVudGVkLmJpbmQobnVsbCwgJ2FkZCcpO1xuYXBpLm9mZiA9IGV2ZW50ZWQuYmluZChudWxsLCAncmVtb3ZlJyk7XG5hcGkuZW1pdCA9IGV2ZW50ZWQuYmluZChudWxsLCAnZmFicmljYXRlJyk7XG5cbmFwaS5odG1sID0gZnVuY3Rpb24gKGVsZW0sIGh0bWwpIHtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGVsZW0uaW5uZXJIVE1MO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJIVE1MID0gaHRtbDtcbiAgfVxufTtcblxuYXBpLnRleHQgPSBmdW5jdGlvbiAoZWxlbSwgdGV4dCkge1xuICB2YXIgY2hlY2thYmxlID0gdGVzdC5pc0NoZWNrYWJsZShlbGVtKTtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGNoZWNrYWJsZSA/IGVsZW0udmFsdWUgOiBlbGVtLmlubmVyVGV4dCB8fCBlbGVtLnRleHRDb250ZW50O1xuICB9IGVsc2UgaWYgKGNoZWNrYWJsZSkge1xuICAgIGVsZW0udmFsdWUgPSB0ZXh0O1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJUZXh0ID0gZWxlbS50ZXh0Q29udGVudCA9IHRleHQ7XG4gIH1cbn07XG5cbmFwaS52YWx1ZSA9IGZ1bmN0aW9uIChlbCwgdmFsdWUpIHtcbiAgdmFyIGNoZWNrYWJsZSA9IHRlc3QuaXNDaGVja2FibGUoZWwpO1xuICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDI7XG4gIGlmIChnZXR0ZXIpIHtcbiAgICByZXR1cm4gY2hlY2thYmxlID8gZWwuY2hlY2tlZCA6IGVsLnZhbHVlO1xuICB9IGVsc2UgaWYgKGNoZWNrYWJsZSkge1xuICAgIGVsLmNoZWNrZWQgPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBlbC52YWx1ZSA9IHZhbHVlO1xuICB9XG59O1xuXG5hcGkuYXR0ciA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgaWYgKCF0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IHJldHVybjtcbiAgfVxuICB2YXIgY2FtZWwgPSB0ZXh0Lmh5cGhlblRvQ2FtZWwobmFtZSk7XG4gIGlmIChjYW1lbCBpbiBlbCkge1xuICAgIGVsW2NhbWVsXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH1cbn07XG5cbmFwaS5nZXRBdHRyID0gZnVuY3Rpb24gKGVsLCBuYW1lKSB7XG4gIHZhciBjYW1lbCA9IHRleHQuaHlwaGVuVG9DYW1lbChuYW1lKTtcbiAgaWYgKGNhbWVsIGluIGVsKSB7XG4gICAgcmV0dXJuIGVsW2NhbWVsXTtcbiAgfSBlbHNlIGlmIChlbC5nZXRBdHRyaWJ1dGUpIHtcbiAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuYXBpLm1hbnlBdHRyID0gZnVuY3Rpb24gKGVsZW0sIGF0dHJzKSB7XG4gIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgYXBpLmF0dHIoZWxlbSwgYXR0ciwgYXR0cnNbYXR0cl0pO1xuICB9KTtcbn07XG5cbmFwaS5tYWtlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIG5ldyBEb21pbnVzKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSkpO1xufTtcblxuYXBpLmNsb25lID0gZnVuY3Rpb24gKGVsKSB7XG4gIGlmIChlbC5jbG9uZU5vZGUpIHtcbiAgICByZXR1cm4gZWwuY2xvbmVOb2RlKHRydWUpO1xuICB9XG4gIHJldHVybiBlbDtcbn07XG5cbmFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgaWYgKGVsLnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxufTtcblxuYXBpLmFwcGVuZCA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkuYXBwZW5kKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWwuYXBwZW5kQ2hpbGQpIHtcbiAgICBlbC5hcHBlbmRDaGlsZCh0YXJnZXQpO1xuICB9XG59O1xuXG5hcGkucHJlcGVuZCA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkucHJlcGVuZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGVsLmluc2VydEJlZm9yZSkge1xuICAgIGVsLmluc2VydEJlZm9yZSh0YXJnZXQsIGVsLmZpcnN0Q2hpbGQpO1xuICB9XG59O1xuXG5hcGkuYmVmb3JlID0gZnVuY3Rpb24gKGVsLCB0YXJnZXQpIHtcbiAgaWYgKG1hbmlwdWxhdGlvbkd1YXJkKGVsLCB0YXJnZXQsIGFwaS5iZWZvcmUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWwucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGFyZ2V0LCBlbCk7XG4gIH1cbn07XG5cbmFwaS5hZnRlciA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbCwgdGFyZ2V0LCBhcGkuYWZ0ZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWwucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGFyZ2V0LCBlbC5uZXh0U2libGluZyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hbmlwdWxhdGlvbkd1YXJkIChlbCwgdGFyZ2V0LCBmbikge1xuICB2YXIgcmlnaHQgPSB0YXJnZXQgaW5zdGFuY2VvZiBEb21pbnVzO1xuICB2YXIgbGVmdCA9IGVsIGluc3RhbmNlb2YgRG9taW51cztcbiAgaWYgKGxlZnQpIHtcbiAgICBlbC5mb3JFYWNoKG1hbmlwdWxhdGVNYW55KTtcbiAgfSBlbHNlIGlmIChyaWdodCkge1xuICAgIG1hbmlwdWxhdGUoZWwsIHRydWUpO1xuICB9XG4gIHJldHVybiAhZWwgfHwgIXRhcmdldCB8fCBsZWZ0IHx8IHJpZ2h0O1xuXG4gIGZ1bmN0aW9uIG1hbmlwdWxhdGUgKGVsLCBwcmVjb25kaXRpb24pIHtcbiAgICBpZiAocmlnaHQpIHtcbiAgICAgIHRhcmdldC5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXQsIGopIHtcbiAgICAgICAgZm4oZWwsIGNsb25lVW5sZXNzKHRhcmdldCwgcHJlY29uZGl0aW9uICYmIGogPT09IDApKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbihlbCwgY2xvbmVVbmxlc3ModGFyZ2V0LCBwcmVjb25kaXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYW5pcHVsYXRlTWFueSAoZWwsIGkpIHtcbiAgICBtYW5pcHVsYXRlKGVsLCBpID09PSAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZVVubGVzcyAodGFyZ2V0LCBjb25kaXRpb24pIHtcbiAgcmV0dXJuIGNvbmRpdGlvbiA/IHRhcmdldCA6IGFwaS5jbG9uZSh0YXJnZXQpO1xufVxuXG5bJ2FwcGVuZFRvJywgJ3ByZXBlbmRUbycsICdiZWZvcmVPZicsICdhZnRlck9mJ10uZm9yRWFjaChmbGlwKTtcblxuZnVuY3Rpb24gZmxpcCAoa2V5KSB7XG4gIHZhciBvcmlnaW5hbCA9IGtleS5zcGxpdCgvW0EtWl0vKVswXTtcbiAgYXBpW2tleV0gPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICAgIGFwaVtvcmlnaW5hbF0odGFyZ2V0LCBlbCk7XG4gIH07XG59XG5cbnZhciBudW1lcmljQ3NzUHJvcGVydGllcyA9IHtcbiAgJ2NvbHVtbi1jb3VudCc6IHRydWUsXG4gICdmaWxsLW9wYWNpdHknOiB0cnVlLFxuICAnZmxleC1ncm93JzogdHJ1ZSxcbiAgJ2ZsZXgtc2hyaW5rJzogdHJ1ZSxcbiAgJ2ZvbnQtd2VpZ2h0JzogdHJ1ZSxcbiAgJ2xpbmUtaGVpZ2h0JzogdHJ1ZSxcbiAgJ29wYWNpdHknOiB0cnVlLFxuICAnb3JkZXInOiB0cnVlLFxuICAnb3JwaGFucyc6IHRydWUsXG4gICd3aWRvd3MnOiB0cnVlLFxuICAnei1pbmRleCc6IHRydWUsXG4gICd6b29tJzogdHJ1ZVxufTtcbnZhciBudW1lcmljID0gL15cXGQrJC87XG52YXIgY2FuRmxvYXQgPSAnZmxvYXQnIGluIGRvY3VtZW50LmJvZHkuc3R5bGU7XG5cbmFwaS5nZXRDc3MgPSBmdW5jdGlvbiAoZWwsIHByb3ApIHtcbiAgaWYgKCF0ZXN0LmlzRWxlbWVudChlbCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgaHByb3AgPSB0ZXh0Lmh5cGhlbmF0ZShwcm9wKTtcbiAgdmFyIGZwcm9wID0gIWNhbkZsb2F0ICYmIGhwcm9wID09PSAnZmxvYXQnID8gJ2Nzc0Zsb2F0JyA6IGhwcm9wO1xuICB2YXIgcmVzdWx0ID0gZ2xvYmFsLmdldENvbXB1dGVkU3R5bGUoZWwpW2hwcm9wXTtcbiAgaWYgKHByb3AgPT09ICdvcGFjaXR5JyAmJiByZXN1bHQgPT09ICcnKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgaWYgKHJlc3VsdC5zdWJzdHIoLTIpID09PSAncHgnIHx8IG51bWVyaWMudGVzdChyZXN1bHQpKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQocmVzdWx0LCAxMCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmFwaS5zZXRDc3MgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgdmFyIG1hcHBlZCA9IE9iamVjdC5rZXlzKHByb3BzKS5maWx0ZXIoYmFkKS5tYXAoZXhwYW5kKTtcbiAgZnVuY3Rpb24gYmFkIChwcm9wKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvcHNbcHJvcF07XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHZhbHVlID09PSB2YWx1ZTtcbiAgfVxuICBmdW5jdGlvbiBleHBhbmQgKHByb3ApIHtcbiAgICB2YXIgaHByb3AgPSB0ZXh0Lmh5cGhlbmF0ZShwcm9wKTtcbiAgICB2YXIgdmFsdWUgPSBwcm9wc1twcm9wXTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhbnVtZXJpY0Nzc1Byb3BlcnRpZXNbaHByb3BdKSB7XG4gICAgICB2YWx1ZSArPSAncHgnO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogaHByb3AsIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbCkge1xuICAgIGlmICghdGVzdC5pc0VsZW1lbnQoZWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG1hcHBlZC5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICBlbC5zdHlsZVtwcm9wLm5hbWVdID0gcHJvcC52YWx1ZTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vRG9taW51cy5wcm90b3R5cGUnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xuXG5mdW5jdGlvbiBmbGF0dGVuIChhLCBjYWNoZSkge1xuICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKGN1cnJlbnQsIGl0ZW0pIHtcbiAgICBpZiAoRG9taW51cy5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICByZXR1cm4gZmxhdHRlbihpdGVtLCBjdXJyZW50KTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBjdXJyZW50LmNvbmNhdChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH0sIGNhY2hlIHx8IG5ldyBEb21pbnVzKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZsYXR0ZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb20gPSByZXF1aXJlKCcuL2RvbScpO1xudmFyIGNhc3QgPSByZXF1aXJlKCcuL2Nhc3QnKTtcbnZhciBjdXN0b20gPSByZXF1aXJlKCcuL2N1c3RvbScpO1xudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xudmFyIHRhZyA9IC9eXFxzKjwoW2Etel0rKD86LVthLXpdKyk/KVxccypcXC8/PlxccyokL2k7XG5cbmZ1bmN0aW9uIGFwaSAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIG5vdFRleHQgPSB0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnO1xuICBpZiAobm90VGV4dCAmJiBhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBjYXN0KHNlbGVjdG9yKTtcbiAgfVxuICBpZiAobm90VGV4dCkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIHZhciBtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2godGFnKTtcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICByZXR1cm4gZG9tLm1ha2UobWF0Y2hlc1sxXSk7XG4gIH1cbiAgcmV0dXJuIGFwaS5maW5kKHNlbGVjdG9yLCBjb250ZXh0KTtcbn1cblxuYXBpLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGRvbS5xc2EoY29udGV4dCwgc2VsZWN0b3IpO1xufTtcblxuYXBpLmZpbmRPbmUgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGRvbS5xcyhjb250ZXh0LCBzZWxlY3Rvcik7XG59O1xuXG5hcGkuY3VzdG9tID0gY3VzdG9tLnJlZ2lzdGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVsZW1lbnRPYmplY3RzID0gdHlwZW9mIEhUTUxFbGVtZW50ID09PSAnb2JqZWN0JztcblxuZnVuY3Rpb24gaXNFbGVtZW50IChvKSB7XG4gIHJldHVybiBlbGVtZW50T2JqZWN0cyA/IG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IGlzRWxlbWVudE9iamVjdChvKTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50T2JqZWN0IChvKSB7XG4gIHJldHVybiBvICYmXG4gICAgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG8ubm9kZU5hbWUgPT09ICdzdHJpbmcnICYmXG4gICAgby5ub2RlVHlwZSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoYSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBpc0NoZWNrYWJsZSAoZWxlbSkge1xuICByZXR1cm4gJ2NoZWNrZWQnIGluIGVsZW0gJiYgZWxlbS50eXBlID09PSAncmFkaW8nIHx8IGVsZW0udHlwZSA9PT0gJ2NoZWNrYm94Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRWxlbWVudDogaXNFbGVtZW50LFxuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0NoZWNrYWJsZTogaXNDaGVja2FibGVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGh5cGhlblRvQ2FtZWwgKGh5cGhlbnMpIHtcbiAgdmFyIHBhcnQgPSAvLShbYS16XSkvZztcbiAgcmV0dXJuIGh5cGhlbnMucmVwbGFjZShwYXJ0LCBmdW5jdGlvbiAoZywgbSkge1xuICAgIHJldHVybiBtLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoeXBoZW5hdGUgKHRleHQpIHtcbiAgdmFyIGNhbWVsID0gLyhbYS16XSkoW0EtWl0pL2c7XG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoY2FtZWwsICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBoeXBoZW5Ub0NhbWVsOiBoeXBoZW5Ub0NhbWVsLFxuICBoeXBoZW5hdGU6IGh5cGhlbmF0ZVxufTtcbiJdfQ==
(12)
});
