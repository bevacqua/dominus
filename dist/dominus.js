/**
 * dominus - Lean DOM Manipulation
 * @version v2.4.2
 * @link https://github.com/bevacqua/dominus
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.dominus=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var poser = _dereq_('./src/node');

module.exports = poser;

['Array', 'Function', 'Object', 'Date', 'String'].forEach(pose);

function pose (type) {
  poser[type] = function poseComputedType () { return poser(type); };
}

},{"./src/node":2}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
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
},{}],4:[function(_dereq_,module,exports){
'use strict';

var poser = _dereq_('poser');
var Dominus = poser.Array();

module.exports = Dominus;

},{"poser":1}],5:[function(_dereq_,module,exports){
'use strict';

var $ = _dereq_('./public');
var core = _dereq_('./core');
var dom = _dereq_('./dom');
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
    var results = core.flatten(result);
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
  return new Dominus(this[index]);
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

Dominus.prototype.on = function (types, filter, fn) {
  this.forEach(function (elem) {
    types.split(' ').forEach(function (type) {
      dom.on(elem, type, filter, fn);
    });
  });
  return this;
};

Dominus.prototype.off = function (types, filter, fn) {
  this.forEach(function (elem) {
    types.split(' ').forEach(function (type) {
      dom.off(elem, type, filter, fn);
    });
  });
  return this;
};

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
  ['append', dom.append],
  ['appendTo', dom.appendTo],
  ['prepend', dom.prepend],
  ['prependTo', dom.prependTo],
  ['before', dom.before],
  ['beforeOf', dom.beforeOf],
  ['after', dom.after],
  ['afterOf', dom.afterOf],
  ['show', dom.show],
  ['hide', dom.hide]
].forEach(mapManipulation);

function mapManipulation (data) {
  Dominus.prototype[data[0]] = function (value) {
    data[1](this, value);
    return this;
  };
}

Dominus.prototype.hasClass = function (value) {
  return this.some(function (elem) {
    return classes.contains(elem, value);
  });
};

Dominus.prototype.attr = function (name, value) {
  var getter = arguments.length < 2;
  var result = this.map(function (elem) {
    return getter ? dom.attr(elem, name) : dom.attr(elem, name, value);
  });
  return getter ? result[0] : this;
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

module.exports = _dereq_('./public');

},{"./Dominus.ctor":4,"./classes":6,"./core":7,"./dom":8,"./public":11}],6:[function(_dereq_,module,exports){
'use strict';

var trim = /^\s+|\s+$/g;
var whitespace = /\s+/g;

function interpret (input) {
  return typeof input === 'string' ? input.replace(trim, '').split(whitespace) : input;
}

function classes (node) {
  return node.className.replace(trim, '').split(whitespace);
}

function set (node, input) {
  node.className = interpret(input).join(' ');
}

function add (node, input) {
  var current = remove(node, input);
  var values = interpret(input);
  current.push.apply(current, values);
  set(node, current);
  return current;
}

function remove (node, input) {
  var current = classes(node);
  var values = interpret(input);
  values.forEach(function (value) {
    var i = current.indexOf(value);
    if (i !== -1) {
      current.splice(i, 1);
    }
  });
  set(node, current);
  return current;
}

function contains (node, input) {
  var current = classes(node);
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

},{}],7:[function(_dereq_,module,exports){
'use strict';

var test = _dereq_('./test');
var Dominus = _dereq_('./Dominus.ctor');
var proto = Dominus.prototype;

function Applied (args) {
  return Dominus.apply(this, args);
}

Applied.prototype = proto;

['map', 'filter', 'concat'].forEach(ensure);

function ensure (key) {
  var original = proto[key];
  proto[key] = function applied () {
    return apply(original.apply(this, arguments));
  };
}

function apply (a) {
  return new Applied(a);
}

function cast (a) {
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

module.exports = {
  apply: apply,
  cast: cast,
  flatten: flatten
};

},{"./Dominus.ctor":4,"./test":12}],8:[function(_dereq_,module,exports){
'use strict';

var sektor = _dereq_('sektor');
var Dominus = _dereq_('./Dominus.ctor');
var core = _dereq_('./core');
var events = _dereq_('./events');
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

api.qsa = function (elem, selector) {
  var results = new Dominus();
  return sektor(selector, castContext(elem), results);
};

api.qs = function (elem, selector) {
  return api.qsa(elem, selector)[0];
};

api.matches = function (elem, selector) {
  return sektor.matchesSelector(elem, selector);
};

function relatedFactory (prop) {
  return function related (elem, selector) {
    var relative = elem[prop];
    if (relative) {
      if (!selector || api.matches(relative, selector)) {
        return core.cast(relative);
      }
    }
    return new Dominus();
  };
}

api.prev = relatedFactory('previousElementSibling');
api.next = relatedFactory('nextElementSibling');
api.parent = relatedFactory('parentElement');

function matches (elem, value) {
  if (!value) {
    return true;
  }
  if (value instanceof Dominus) {
    return value.indexOf(elem) !== -1;
  }
  if (test.isElement(value)) {
    return elem === value;
  }
  return api.matches(elem, value);
}

api.parents = function (elem, value) {
  var nodes = [];
  var node = elem;
  while (node.parentElement) {
    if (matches(node.parentElement, value)) {
      nodes.push(node.parentElement);
    }
    node = node.parentElement;
  }
  return core.apply(nodes);
};

api.children = function (elem, value) {
  var nodes = [];
  var children = elem.children;
  var child;
  var i;
  for (i = 0; i < children.length; i++) {
    child = children[i];
    if (matches(child, value)) {
      nodes.push(child);
    }
  }
  return core.apply(nodes);
};

// this method caches delegates so that .off() works seamlessly
function delegate (root, filter, fn) {
  if (delegates[fn._dd]) {
    return delegates[fn._dd];
  }
  fn._dd = Date.now();
  delegates[fn._dd] = delegator;
  function delegator (e) {
    var elem = e.target;
    while (elem && elem !== root) {
      if (api.matches(elem, filter)) {
        fn.apply(this, arguments); return;
      }
      elem = elem.parentElement;
    }
  }
  return delegator;
}

api.on = function (elem, type, filter, fn) {
  if (fn === void 0) {
    events.add(elem, type, filter); // filter _is_ fn
  } else {
    events.add(elem, type, delegate(elem, filter, fn));
  }
};

api.off = function (elem, type, filter, fn) {
  if (fn === void 0) {
    events.remove(elem, type, filter); // filter _is_ fn
  } else {
    events.remove(elem, type, delegate(elem, filter, fn));
  }
};

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

api.value = function (elem, value) {
  var checkable = test.isCheckable(elem);
  var getter = arguments.length < 2;
  if (getter) {
    return checkable ? elem.checked : elem.value;
  } else if (checkable) {
    elem.checked = value;
  } else {
    elem.value = value;
  }
};

api.attr = function (elem, name, value) {
  var getter = arguments.length < 3;
  var camel = text.hyphenToCamel(name);
  if (getter) {
    if (camel in elem) {
      return elem[camel];
    } else {
      return elem.getAttribute(name, value);
    }
  }
  if (camel in elem) {
    elem[camel] = value;
  } else if (value === null || value === void 0) {
    elem.removeAttribute(name);
  } else {
    elem.setAttribute(name, value);
  }
};

api.make = function (type) {
  return new Dominus(document.createElement(type));
};

api.clone = function (elem) {
  return elem.cloneNode(true);
};

api.remove = function (elem) {
  if (elem.parentElement) {
    elem.parentElement.removeChild(elem);
  }
};

api.append = function (elem, target) {
  if (manipulationGuard(elem, target, api.append)) {
    return;
  }
  elem.appendChild(target);
};

api.prepend = function (elem, target) {
  if (manipulationGuard(elem, target, api.prepend)) {
    return;
  }
  elem.insertBefore(target, elem.firstChild);
};

api.before = function (elem, target) {
  if (manipulationGuard(elem, target, api.before)) {
    return;
  }
  if (elem.parentElement) {
    elem.parentElement.insertBefore(target, elem);
  }
};

api.after = function (elem, target) {
  if (manipulationGuard(elem, target, api.after)) {
    return;
  }
  if (elem.parentElement) {
    elem.parentElement.insertBefore(target, elem.nextSibling);
  }
};

function manipulationGuard (elem, target, fn) {
  var right = target instanceof Dominus;
  var left = elem instanceof Dominus;
  if (left) {
    elem.forEach(manipulateMany);
  } else if (right) {
    manipulate(elem, true);
  }
  return left || right;

  function manipulate (elem, precondition) {
    if (right) {
      target.forEach(function (target, j) {
        fn(elem, cloneUnless(target, precondition && j === 0));
      });
    } else {
      fn(elem, cloneUnless(target, precondition));
    }
  }

  function manipulateMany (elem, i) {
    manipulate(elem, i === 0);
  }
}

function cloneUnless (target, condition) {
  return condition ? target : api.clone(target);
}

['appendTo', 'prependTo', 'beforeOf', 'afterOf'].forEach(flip);

function flip (key) {
  var original = key.split(/[A-Z]/)[0];
  api[key] = function (elem, target) {
    api[original](target, elem);
  };
}

api.show = function (elem, should, invert) {
  if (elem instanceof Dominus) {
    elem.forEach(showTest);
  } else {
    showTest(elem);
  }

  function showTest (current) {
    var ok = should === void 0 || should === true || typeof should === 'function' && should.call(current);
    display(current, invert ? !ok : ok);
  }
};

api.hide = function (elem, should) {
  api.show(elem, should, true);
};

function display (elem, should) {
  if (should) {
    elem.style.display = 'block';
  } else {
    elem.style.display = 'none';
  }
}

function hyphenate (text) {
  var camel = /([a-z])([A-Z])/g;
  return text.replace(camel, '$1-$2').toLowerCase();
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

api.getCss = function (elem, prop) {
  var hprop = hyphenate(prop);
  var result = window.getComputedStyle(elem)[hprop];
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
    var hprop = hyphenate(prop);
    var value = props[prop];
    if (typeof value === 'number' && !numericCssProperties[hprop]) {
      value += 'px';
    }
    return {
      name: hprop, value: value
    };
  }
  return function (elem) {
    mapped.forEach(function (prop) {
      elem.style[prop.name] = prop.value;
    });
  };
};

},{"./Dominus.ctor":4,"./core":7,"./events":10,"./test":12,"./text":13,"sektor":3}],9:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./Dominus.prototype');

},{"./Dominus.prototype":5}],10:[function(_dereq_,module,exports){
'use strict';

var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!window.addEventListener) {
  addEvent = addEventHard;
}

if (!window.removeEventListener) {
  removeEvent = removeEventHard;
}

function addEventEasy (element, evt, fn) {
  return element.addEventListener(evt, fn);
}

function addEventHard (element, evt, fn) {
  return element.attachEvent('on' + evt, wrap(element, evt, fn));
}

function removeEventEasy (element, evt, fn) {
  return element.removeEventListener(evt, fn);
}

function removeEventHard (element, evt, fn) {
  return element.detachEvent('on' + evt, unwrap(element, evt, fn));
}

function wrapperFactory (element, evt, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || window.event;
    e.target = e.target || e.srcElement;
    e.preventDefault  = e.preventDefault  || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    fn.call(element, e);
  };
}

function wrap (element, evt, fn) {
  var wrapper = unwrap(element, evt, fn) || wrapperFactory(element, evt, fn);
  hardCache.push({
    wrapper: wrapper,
    element: element,
    evt: evt,
    fn: fn
  });
  return wrapper;
}

function unwrap (element, evt, fn) {
  var i = find(element, evt, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (element, evt, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === element && item.evt === evt && item.fn === fn) {
      return i;
    }
  }
}

module.exports = {
  add: addEvent,
  remove: removeEvent
};

},{}],11:[function(_dereq_,module,exports){
'use strict';

var dom = _dereq_('./dom');
var core = _dereq_('./core');
var Dominus = _dereq_('./Dominus.ctor');
var tag = /^\s*<([a-z]+(?:-[a-z]+)?)\s*\/?>\s*$/i;

function api (selector, context) {
  var notText = typeof selector !== 'string';
  if (notText && arguments.length < 2) {
    return core.cast(selector);
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

module.exports = api;

},{"./Dominus.ctor":4,"./core":7,"./dom":8}],12:[function(_dereq_,module,exports){
'use strict';

var nodeObjects = typeof Node === 'object';
var elementObjects = typeof HTMLElement === 'object';

function isNode (o) {
  return nodeObjects ? o instanceof Node : isNodeObject(o);
}

function isNodeObject (o) {
  return o &&
    typeof o === 'object' &&
    typeof o.nodeName === 'string' &&
    typeof o.nodeType === 'number';
}

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
  isNode: isNode,
  isElement: isElement,
  isArray: isArray,
  isCheckable: isCheckable
};

},{}],13:[function(_dereq_,module,exports){
'use strict';

function hyphenToCamel (hyphens) {
  var part = /-([a-z])/g;
  return hyphens.replace(part, function (g, m) {
    return m.toUpperCase();
  });
}

module.exports = {
  hyphenToCamel: hyphenToCamel
};

},{}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvcG9zZXIvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvcG9zZXIvc3JjL2Jyb3dzZXIuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9ub2RlX21vZHVsZXMvc2VrdG9yL3NyYy9zZWt0b3IuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvRG9taW51cy5jdG9yLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL0RvbWludXMucHJvdG90eXBlLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL2NsYXNzZXMuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvY29yZS5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL3NyYy9kb20uanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvZG9taW51cy5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9kb21pbnVzL3NyYy9ldmVudHMuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvcHVibGljLmpzIiwiL1VzZXJzL25pY28vZGV2L2RvbWludXMvc3JjL3Rlc3QuanMiLCIvVXNlcnMvbmljby9kZXYvZG9taW51cy9zcmMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZWQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHBvc2VyID0gcmVxdWlyZSgnLi9zcmMvbm9kZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2VyO1xuXG5bJ0FycmF5JywgJ0Z1bmN0aW9uJywgJ09iamVjdCcsICdEYXRlJywgJ1N0cmluZyddLmZvckVhY2gocG9zZSk7XG5cbmZ1bmN0aW9uIHBvc2UgKHR5cGUpIHtcbiAgcG9zZXJbdHlwZV0gPSBmdW5jdGlvbiBwb3NlQ29tcHV0ZWRUeXBlICgpIHsgcmV0dXJuIHBvc2VyKHR5cGUpOyB9O1xufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZCA9IGdsb2JhbC5kb2N1bWVudDtcblxuZnVuY3Rpb24gcG9zZXIgKHR5cGUpIHtcbiAgdmFyIGlmcmFtZSA9IGQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG5cbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXG4gIHJldHVybiBtYXAodHlwZSwgaWZyYW1lLmNvbnRlbnRXaW5kb3cpO1xufVxuXG5mdW5jdGlvbiBtYXAgKHR5cGUsIHNvdXJjZSkgeyAvLyBmb3J3YXJkIHBvbHlmaWxscyB0byB0aGUgc3RvbGVuIHJlZmVyZW5jZSFcbiAgdmFyIG9yaWdpbmFsID0gd2luZG93W3R5cGVdLnByb3RvdHlwZTtcbiAgdmFyIHZhbHVlID0gc291cmNlW3R5cGVdO1xuICB2YXIgcHJvcDtcblxuICBmb3IgKHByb3AgaW4gb3JpZ2luYWwpIHtcbiAgICB2YWx1ZS5wcm90b3R5cGVbcHJvcF0gPSBvcmlnaW5hbFtwcm9wXTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwb3NlcjtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBleHBhbmRvID0gJ3Nla3Rvci0nICsgRGF0ZS5ub3coKTtcbnZhciByc2libGluZ3MgPSAvWyt+XS87XG52YXIgZG9jdW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQ7XG52YXIgZGVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIG1hdGNoID0gZGVsLm1hdGNoZXMgfHxcbiAgICAgICAgICAgIGRlbC53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgIGRlbC5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgIGRlbC5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICBkZWwubXNNYXRjaGVzU2VsZWN0b3I7XG5cbmZ1bmN0aW9uIHFzYSAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIGV4aXN0ZWQsIGlkLCBwcmVmaXgsIHByZWZpeGVkLCBhZGFwdGVyLCBoYWNrID0gY29udGV4dCAhPT0gZG9jdW1lbnQ7XG4gIGlmIChoYWNrKSB7IC8vIGlkIGhhY2sgZm9yIGNvbnRleHQtcm9vdGVkIHF1ZXJpZXNcbiAgICBleGlzdGVkID0gY29udGV4dC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgaWQgPSBleGlzdGVkIHx8IGV4cGFuZG87XG4gICAgcHJlZml4ID0gJyMnICsgaWQgKyAnICc7XG4gICAgcHJlZml4ZWQgPSBwcmVmaXggKyBzZWxlY3Rvci5yZXBsYWNlKC8sL2csICcsJyArIHByZWZpeCk7XG4gICAgYWRhcHRlciA9IHJzaWJsaW5ncy50ZXN0KHNlbGVjdG9yKSAmJiBjb250ZXh0LnBhcmVudE5vZGU7XG4gICAgaWYgKCFleGlzdGVkKSB7IGNvbnRleHQuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTsgfVxuICB9XG4gIHRyeSB7XG4gICAgcmV0dXJuIChhZGFwdGVyIHx8IGNvbnRleHQpLnF1ZXJ5U2VsZWN0b3JBbGwocHJlZml4ZWQgfHwgc2VsZWN0b3IpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9IGZpbmFsbHkge1xuICAgIGlmIChleGlzdGVkID09PSBudWxsKSB7IGNvbnRleHQucmVtb3ZlQXR0cmlidXRlKCdpZCcpOyB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZCAoc2VsZWN0b3IsIGN0eCwgY29sbGVjdGlvbiwgc2VlZCkge1xuICB2YXIgZWxlbWVudDtcbiAgdmFyIGNvbnRleHQgPSBjdHggfHwgZG9jdW1lbnQ7XG4gIHZhciByZXN1bHRzID0gY29sbGVjdGlvbiB8fCBbXTtcbiAgdmFyIGkgPSAwO1xuICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG4gIGlmIChjb250ZXh0Lm5vZGVUeXBlICE9PSAxICYmIGNvbnRleHQubm9kZVR5cGUgIT09IDkpIHtcbiAgICByZXR1cm4gW107IC8vIGJhaWwgaWYgY29udGV4dCBpcyBub3QgYW4gZWxlbWVudCBvciBkb2N1bWVudFxuICB9XG4gIGlmIChzZWVkKSB7XG4gICAgd2hpbGUgKChlbGVtZW50ID0gc2VlZFtpKytdKSkge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXN1bHRzLnB1c2guYXBwbHkocmVzdWx0cywgcXNhKHNlbGVjdG9yLCBjb250ZXh0KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmZ1bmN0aW9uIG1hdGNoZXMgKHNlbGVjdG9yLCBlbGVtZW50cykge1xuICByZXR1cm4gZmluZChzZWxlY3RvciwgbnVsbCwgbnVsbCwgZWxlbWVudHMpO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gIHJldHVybiBtYXRjaC5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kO1xuXG5maW5kLm1hdGNoZXMgPSBtYXRjaGVzO1xuZmluZC5tYXRjaGVzU2VsZWN0b3IgPSBtYXRjaGVzU2VsZWN0b3I7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcG9zZXIgPSByZXF1aXJlKCdwb3NlcicpO1xudmFyIERvbWludXMgPSBwb3Nlci5BcnJheSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERvbWludXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnLi9wdWJsaWMnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9jb3JlJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb20nKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnLi9jbGFzc2VzJyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG5cbmZ1bmN0aW9uIGVxdWFscyAoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVxdWFscyAoZWxlbSkge1xuICAgIHJldHVybiBkb20ubWF0Y2hlcyhlbGVtLCBzZWxlY3Rvcik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0cmFpZ2h0IChwcm9wLCBvbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRvbU1hcHBpbmcgKHNlbGVjdG9yKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMubWFwKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICByZXR1cm4gZG9tW3Byb3BdKGVsZW0sIHNlbGVjdG9yKTtcbiAgICB9KTtcbiAgICB2YXIgcmVzdWx0cyA9IGNvcmUuZmxhdHRlbihyZXN1bHQpO1xuICAgIHJldHVybiBvbmUgPyByZXN1bHRzWzBdIDogcmVzdWx0cztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUucHJldiA9IHN0cmFpZ2h0KCdwcmV2Jyk7XG5Eb21pbnVzLnByb3RvdHlwZS5uZXh0ID0gc3RyYWlnaHQoJ25leHQnKTtcbkRvbWludXMucHJvdG90eXBlLnBhcmVudCA9IHN0cmFpZ2h0KCdwYXJlbnQnKTtcbkRvbWludXMucHJvdG90eXBlLnBhcmVudHMgPSBzdHJhaWdodCgncGFyZW50cycpO1xuRG9taW51cy5wcm90b3R5cGUuY2hpbGRyZW4gPSBzdHJhaWdodCgnY2hpbGRyZW4nKTtcbkRvbWludXMucHJvdG90eXBlLmZpbmQgPSBzdHJhaWdodCgncXNhJyk7XG5Eb21pbnVzLnByb3RvdHlwZS5maW5kT25lID0gc3RyYWlnaHQoJ3FzJywgdHJ1ZSk7XG5cbkRvbWludXMucHJvdG90eXBlLndoZXJlID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0aGlzLmZpbHRlcihlcXVhbHMoc2VsZWN0b3IpKTtcbn07XG5cbkRvbWludXMucHJvdG90eXBlLmlzID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0aGlzLnNvbWUoZXF1YWxzKHNlbGVjdG9yKSk7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIHJldHVybiBuZXcgRG9taW51cyh0aGlzW2luZGV4XSk7XG59O1xuXG5mdW5jdGlvbiBjb21wYXJlRmFjdG9yeSAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbXBhcmUgKCkge1xuICAgICQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5mb3JFYWNoKGZuLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn1cblxuRG9taW51cy5wcm90b3R5cGUuYW5kID0gY29tcGFyZUZhY3RvcnkoZnVuY3Rpb24gYWRkT25lIChlbGVtKSB7XG4gIGlmICh0aGlzLmluZGV4T2YoZWxlbSkgPT09IC0xKSB7XG4gICAgdGhpcy5wdXNoKGVsZW0pO1xuICB9XG4gIHJldHVybiB0aGlzO1xufSk7XG5cbkRvbWludXMucHJvdG90eXBlLmJ1dCA9IGNvbXBhcmVGYWN0b3J5KGZ1bmN0aW9uIGFkZE9uZSAoZWxlbSkge1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YoZWxlbSk7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59KTtcblxuRG9taW51cy5wcm90b3R5cGUuY3NzID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBwcm9wcztcbiAgdmFyIG1hbnkgPSBuYW1lICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JztcbiAgdmFyIGdldHRlciA9ICFtYW55ICYmICF2YWx1ZTtcbiAgaWYgKGdldHRlcikge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA/IGRvbS5nZXRDc3ModGhpc1swXSwgbmFtZSkgOiBudWxsO1xuICB9XG4gIGlmIChtYW55KSB7XG4gICAgcHJvcHMgPSBuYW1lO1xuICB9IGVsc2Uge1xuICAgIHByb3BzID0ge307XG4gICAgcHJvcHNbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuICB0aGlzLmZvckVhY2goZG9tLnNldENzcyhwcm9wcykpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkRvbWludXMucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKHR5cGVzLCBmaWx0ZXIsIGZuKSB7XG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xuICAgIHR5cGVzLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgZG9tLm9uKGVsZW0sIHR5cGUsIGZpbHRlciwgZm4pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Eb21pbnVzLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAodHlwZXMsIGZpbHRlciwgZm4pIHtcbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgdHlwZXMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICBkb20ub2ZmKGVsZW0sIHR5cGUsIGZpbHRlciwgZm4pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5bXG4gIFsnYWRkQ2xhc3MnLCBjbGFzc2VzLmFkZF0sXG4gIFsncmVtb3ZlQ2xhc3MnLCBjbGFzc2VzLnJlbW92ZV0sXG4gIFsnc2V0Q2xhc3MnLCBjbGFzc2VzLnNldF0sXG4gIFsncmVtb3ZlQ2xhc3MnLCBjbGFzc2VzLnJlbW92ZV0sXG4gIFsncmVtb3ZlJywgZG9tLnJlbW92ZV1cbl0uZm9yRWFjaChtYXBNZXRob2RzKTtcblxuZnVuY3Rpb24gbWFwTWV0aG9kcyAoZGF0YSkge1xuICBEb21pbnVzLnByb3RvdHlwZVtkYXRhWzBdXSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgZGF0YVsxXShlbGVtLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbltcbiAgWydhcHBlbmQnLCBkb20uYXBwZW5kXSxcbiAgWydhcHBlbmRUbycsIGRvbS5hcHBlbmRUb10sXG4gIFsncHJlcGVuZCcsIGRvbS5wcmVwZW5kXSxcbiAgWydwcmVwZW5kVG8nLCBkb20ucHJlcGVuZFRvXSxcbiAgWydiZWZvcmUnLCBkb20uYmVmb3JlXSxcbiAgWydiZWZvcmVPZicsIGRvbS5iZWZvcmVPZl0sXG4gIFsnYWZ0ZXInLCBkb20uYWZ0ZXJdLFxuICBbJ2FmdGVyT2YnLCBkb20uYWZ0ZXJPZl0sXG4gIFsnc2hvdycsIGRvbS5zaG93XSxcbiAgWydoaWRlJywgZG9tLmhpZGVdXG5dLmZvckVhY2gobWFwTWFuaXB1bGF0aW9uKTtcblxuZnVuY3Rpb24gbWFwTWFuaXB1bGF0aW9uIChkYXRhKSB7XG4gIERvbWludXMucHJvdG90eXBlW2RhdGFbMF1dID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgZGF0YVsxXSh0aGlzLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59XG5cbkRvbWludXMucHJvdG90eXBlLmhhc0NsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICByZXR1cm4gY2xhc3Nlcy5jb250YWlucyhlbGVtLCB2YWx1ZSk7XG4gIH0pO1xufTtcblxuRG9taW51cy5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDI7XG4gIHZhciByZXN1bHQgPSB0aGlzLm1hcChmdW5jdGlvbiAoZWxlbSkge1xuICAgIHJldHVybiBnZXR0ZXIgPyBkb20uYXR0cihlbGVtLCBuYW1lKSA6IGRvbS5hdHRyKGVsZW0sIG5hbWUsIHZhbHVlKTtcbiAgfSk7XG4gIHJldHVybiBnZXR0ZXIgPyByZXN1bHRbMF0gOiB0aGlzO1xufTtcblxuZnVuY3Rpb24ga2V5VmFsdWUgKGtleSwgdmFsdWUpIHtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID8gZG9tW2tleV0odGhpc1swXSkgOiAnJztcbiAgfVxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICBkb21ba2V5XShlbGVtLCB2YWx1ZSk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24ga2V5VmFsdWVQcm9wZXJ0eSAocHJvcCkge1xuICBEb21pbnVzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uIGFjY2Vzc29yICh2YWx1ZSkge1xuICAgIHZhciBnZXR0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMTtcbiAgICBpZiAoZ2V0dGVyKSB7XG4gICAgICByZXR1cm4ga2V5VmFsdWUuY2FsbCh0aGlzLCBwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleVZhbHVlLmNhbGwodGhpcywgcHJvcCwgdmFsdWUpO1xuICB9O1xufVxuXG5bJ2h0bWwnLCAndGV4dCcsICd2YWx1ZSddLmZvckVhY2goa2V5VmFsdWVQcm9wZXJ0eSk7XG5cbkRvbWludXMucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICByZXR1cm4gZG9tLmNsb25lKGVsZW0pO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9wdWJsaWMnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyaW0gPSAvXlxccyt8XFxzKyQvZztcbnZhciB3aGl0ZXNwYWNlID0gL1xccysvZztcblxuZnVuY3Rpb24gaW50ZXJwcmV0IChpbnB1dCkge1xuICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/IGlucHV0LnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpIDogaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZXMgKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lLnJlcGxhY2UodHJpbSwgJycpLnNwbGl0KHdoaXRlc3BhY2UpO1xufVxuXG5mdW5jdGlvbiBzZXQgKG5vZGUsIGlucHV0KSB7XG4gIG5vZGUuY2xhc3NOYW1lID0gaW50ZXJwcmV0KGlucHV0KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIGFkZCAobm9kZSwgaW5wdXQpIHtcbiAgdmFyIGN1cnJlbnQgPSByZW1vdmUobm9kZSwgaW5wdXQpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcbiAgY3VycmVudC5wdXNoLmFwcGx5KGN1cnJlbnQsIHZhbHVlcyk7XG4gIHNldChub2RlLCBjdXJyZW50KTtcbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAobm9kZSwgaW5wdXQpIHtcbiAgdmFyIGN1cnJlbnQgPSBjbGFzc2VzKG5vZGUpO1xuICB2YXIgdmFsdWVzID0gaW50ZXJwcmV0KGlucHV0KTtcbiAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGkgPSBjdXJyZW50LmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgY3VycmVudC5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9KTtcbiAgc2V0KG5vZGUsIGN1cnJlbnQpO1xuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gY29udGFpbnMgKG5vZGUsIGlucHV0KSB7XG4gIHZhciBjdXJyZW50ID0gY2xhc3Nlcyhub2RlKTtcbiAgdmFyIHZhbHVlcyA9IGludGVycHJldChpbnB1dCk7XG5cbiAgcmV0dXJuIHZhbHVlcy5ldmVyeShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gY3VycmVudC5pbmRleE9mKHZhbHVlKSAhPT0gLTE7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGQsXG4gIHJlbW92ZTogcmVtb3ZlLFxuICBjb250YWluczogY29udGFpbnMsXG4gIHNldDogc2V0LFxuICBnZXQ6IGNsYXNzZXNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0ZXN0ID0gcmVxdWlyZSgnLi90ZXN0Jyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG52YXIgcHJvdG8gPSBEb21pbnVzLnByb3RvdHlwZTtcblxuZnVuY3Rpb24gQXBwbGllZCAoYXJncykge1xuICByZXR1cm4gRG9taW51cy5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuQXBwbGllZC5wcm90b3R5cGUgPSBwcm90bztcblxuWydtYXAnLCAnZmlsdGVyJywgJ2NvbmNhdCddLmZvckVhY2goZW5zdXJlKTtcblxuZnVuY3Rpb24gZW5zdXJlIChrZXkpIHtcbiAgdmFyIG9yaWdpbmFsID0gcHJvdG9ba2V5XTtcbiAgcHJvdG9ba2V5XSA9IGZ1bmN0aW9uIGFwcGxpZWQgKCkge1xuICAgIHJldHVybiBhcHBseShvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXBwbHkgKGEpIHtcbiAgcmV0dXJuIG5ldyBBcHBsaWVkKGEpO1xufVxuXG5mdW5jdGlvbiBjYXN0IChhKSB7XG4gIGlmIChhIGluc3RhbmNlb2YgRG9taW51cykge1xuICAgIHJldHVybiBhO1xuICB9XG4gIGlmICghYSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIGlmICh0ZXN0LmlzRWxlbWVudChhKSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cyhhKTtcbiAgfVxuICBpZiAoIXRlc3QuaXNBcnJheShhKSkge1xuICAgIHJldHVybiBuZXcgRG9taW51cygpO1xuICB9XG4gIHJldHVybiBhcHBseShhKS5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcbiAgICByZXR1cm4gdGVzdC5pc0VsZW1lbnQoaSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuIChhLCBjYWNoZSkge1xuICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKGN1cnJlbnQsIGl0ZW0pIHtcbiAgICBpZiAoRG9taW51cy5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICByZXR1cm4gZmxhdHRlbihpdGVtLCBjdXJyZW50KTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQuaW5kZXhPZihpdGVtKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBjdXJyZW50LmNvbmNhdChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH0sIGNhY2hlIHx8IG5ldyBEb21pbnVzKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBwbHk6IGFwcGx5LFxuICBjYXN0OiBjYXN0LFxuICBmbGF0dGVuOiBmbGF0dGVuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VrdG9yID0gcmVxdWlyZSgnc2VrdG9yJyk7XG52YXIgRG9taW51cyA9IHJlcXVpcmUoJy4vRG9taW51cy5jdG9yJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY29yZScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgdGV4dCA9IHJlcXVpcmUoJy4vdGV4dCcpO1xudmFyIHRlc3QgPSByZXF1aXJlKCcuL3Rlc3QnKTtcbnZhciBhcGkgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIGRlbGVnYXRlcyA9IHt9O1xuXG5mdW5jdGlvbiBjYXN0Q29udGV4dCAoY29udGV4dCkge1xuICBpZiAodHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGFwaS5xcyhudWxsLCBjb250ZXh0KTtcbiAgfVxuICBpZiAodGVzdC5pc0VsZW1lbnQoY29udGV4dCkpIHtcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gY29udGV4dFswXTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuYXBpLnFzYSA9IGZ1bmN0aW9uIChlbGVtLCBzZWxlY3Rvcikge1xuICB2YXIgcmVzdWx0cyA9IG5ldyBEb21pbnVzKCk7XG4gIHJldHVybiBzZWt0b3Ioc2VsZWN0b3IsIGNhc3RDb250ZXh0KGVsZW0pLCByZXN1bHRzKTtcbn07XG5cbmFwaS5xcyA9IGZ1bmN0aW9uIChlbGVtLCBzZWxlY3Rvcikge1xuICByZXR1cm4gYXBpLnFzYShlbGVtLCBzZWxlY3RvcilbMF07XG59O1xuXG5hcGkubWF0Y2hlcyA9IGZ1bmN0aW9uIChlbGVtLCBzZWxlY3Rvcikge1xuICByZXR1cm4gc2VrdG9yLm1hdGNoZXNTZWxlY3RvcihlbGVtLCBzZWxlY3Rvcik7XG59O1xuXG5mdW5jdGlvbiByZWxhdGVkRmFjdG9yeSAocHJvcCkge1xuICByZXR1cm4gZnVuY3Rpb24gcmVsYXRlZCAoZWxlbSwgc2VsZWN0b3IpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSBlbGVtW3Byb3BdO1xuICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgaWYgKCFzZWxlY3RvciB8fCBhcGkubWF0Y2hlcyhyZWxhdGl2ZSwgc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBjb3JlLmNhc3QocmVsYXRpdmUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERvbWludXMoKTtcbiAgfTtcbn1cblxuYXBpLnByZXYgPSByZWxhdGVkRmFjdG9yeSgncHJldmlvdXNFbGVtZW50U2libGluZycpO1xuYXBpLm5leHQgPSByZWxhdGVkRmFjdG9yeSgnbmV4dEVsZW1lbnRTaWJsaW5nJyk7XG5hcGkucGFyZW50ID0gcmVsYXRlZEZhY3RvcnkoJ3BhcmVudEVsZW1lbnQnKTtcblxuZnVuY3Rpb24gbWF0Y2hlcyAoZWxlbSwgdmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERvbWludXMpIHtcbiAgICByZXR1cm4gdmFsdWUuaW5kZXhPZihlbGVtKSAhPT0gLTE7XG4gIH1cbiAgaWYgKHRlc3QuaXNFbGVtZW50KHZhbHVlKSkge1xuICAgIHJldHVybiBlbGVtID09PSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gYXBpLm1hdGNoZXMoZWxlbSwgdmFsdWUpO1xufVxuXG5hcGkucGFyZW50cyA9IGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgdmFyIG5vZGUgPSBlbGVtO1xuICB3aGlsZSAobm9kZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgaWYgKG1hdGNoZXMobm9kZS5wYXJlbnRFbGVtZW50LCB2YWx1ZSkpIHtcbiAgICAgIG5vZGVzLnB1c2gobm9kZS5wYXJlbnRFbGVtZW50KTtcbiAgICB9XG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgfVxuICByZXR1cm4gY29yZS5hcHBseShub2Rlcyk7XG59O1xuXG5hcGkuY2hpbGRyZW4gPSBmdW5jdGlvbiAoZWxlbSwgdmFsdWUpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIHZhciBjaGlsZHJlbiA9IGVsZW0uY2hpbGRyZW47XG4gIHZhciBjaGlsZDtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgaWYgKG1hdGNoZXMoY2hpbGQsIHZhbHVlKSkge1xuICAgICAgbm9kZXMucHVzaChjaGlsZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3JlLmFwcGx5KG5vZGVzKTtcbn07XG5cbi8vIHRoaXMgbWV0aG9kIGNhY2hlcyBkZWxlZ2F0ZXMgc28gdGhhdCAub2ZmKCkgd29ya3Mgc2VhbWxlc3NseVxuZnVuY3Rpb24gZGVsZWdhdGUgKHJvb3QsIGZpbHRlciwgZm4pIHtcbiAgaWYgKGRlbGVnYXRlc1tmbi5fZGRdKSB7XG4gICAgcmV0dXJuIGRlbGVnYXRlc1tmbi5fZGRdO1xuICB9XG4gIGZuLl9kZCA9IERhdGUubm93KCk7XG4gIGRlbGVnYXRlc1tmbi5fZGRdID0gZGVsZWdhdG9yO1xuICBmdW5jdGlvbiBkZWxlZ2F0b3IgKGUpIHtcbiAgICB2YXIgZWxlbSA9IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbGVtICYmIGVsZW0gIT09IHJvb3QpIHtcbiAgICAgIGlmIChhcGkubWF0Y2hlcyhlbGVtLCBmaWx0ZXIpKSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW0gPSBlbGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWxlZ2F0b3I7XG59XG5cbmFwaS5vbiA9IGZ1bmN0aW9uIChlbGVtLCB0eXBlLCBmaWx0ZXIsIGZuKSB7XG4gIGlmIChmbiA9PT0gdm9pZCAwKSB7XG4gICAgZXZlbnRzLmFkZChlbGVtLCB0eXBlLCBmaWx0ZXIpOyAvLyBmaWx0ZXIgX2lzXyBmblxuICB9IGVsc2Uge1xuICAgIGV2ZW50cy5hZGQoZWxlbSwgdHlwZSwgZGVsZWdhdGUoZWxlbSwgZmlsdGVyLCBmbikpO1xuICB9XG59O1xuXG5hcGkub2ZmID0gZnVuY3Rpb24gKGVsZW0sIHR5cGUsIGZpbHRlciwgZm4pIHtcbiAgaWYgKGZuID09PSB2b2lkIDApIHtcbiAgICBldmVudHMucmVtb3ZlKGVsZW0sIHR5cGUsIGZpbHRlcik7IC8vIGZpbHRlciBfaXNfIGZuXG4gIH0gZWxzZSB7XG4gICAgZXZlbnRzLnJlbW92ZShlbGVtLCB0eXBlLCBkZWxlZ2F0ZShlbGVtLCBmaWx0ZXIsIGZuKSk7XG4gIH1cbn07XG5cbmFwaS5odG1sID0gZnVuY3Rpb24gKGVsZW0sIGh0bWwpIHtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGVsZW0uaW5uZXJIVE1MO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJIVE1MID0gaHRtbDtcbiAgfVxufTtcblxuYXBpLnRleHQgPSBmdW5jdGlvbiAoZWxlbSwgdGV4dCkge1xuICB2YXIgY2hlY2thYmxlID0gdGVzdC5pc0NoZWNrYWJsZShlbGVtKTtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGNoZWNrYWJsZSA/IGVsZW0udmFsdWUgOiBlbGVtLmlubmVyVGV4dCB8fCBlbGVtLnRleHRDb250ZW50O1xuICB9IGVsc2UgaWYgKGNoZWNrYWJsZSkge1xuICAgIGVsZW0udmFsdWUgPSB0ZXh0O1xuICB9IGVsc2Uge1xuICAgIGVsZW0uaW5uZXJUZXh0ID0gZWxlbS50ZXh0Q29udGVudCA9IHRleHQ7XG4gIH1cbn07XG5cbmFwaS52YWx1ZSA9IGZ1bmN0aW9uIChlbGVtLCB2YWx1ZSkge1xuICB2YXIgY2hlY2thYmxlID0gdGVzdC5pc0NoZWNrYWJsZShlbGVtKTtcbiAgdmFyIGdldHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAyO1xuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIGNoZWNrYWJsZSA/IGVsZW0uY2hlY2tlZCA6IGVsZW0udmFsdWU7XG4gIH0gZWxzZSBpZiAoY2hlY2thYmxlKSB7XG4gICAgZWxlbS5jaGVja2VkID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgZWxlbS52YWx1ZSA9IHZhbHVlO1xuICB9XG59O1xuXG5hcGkuYXR0ciA9IGZ1bmN0aW9uIChlbGVtLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgZ2V0dGVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDM7XG4gIHZhciBjYW1lbCA9IHRleHQuaHlwaGVuVG9DYW1lbChuYW1lKTtcbiAgaWYgKGdldHRlcikge1xuICAgIGlmIChjYW1lbCBpbiBlbGVtKSB7XG4gICAgICByZXR1cm4gZWxlbVtjYW1lbF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbGVtLmdldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGlmIChjYW1lbCBpbiBlbGVtKSB7XG4gICAgZWxlbVtjYW1lbF0gPSB2YWx1ZTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9XG59O1xuXG5hcGkubWFrZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiBuZXcgRG9taW51cyhkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpKTtcbn07XG5cbmFwaS5jbG9uZSA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gIHJldHVybiBlbGVtLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoZWxlbSkge1xuICBpZiAoZWxlbS5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW0pO1xuICB9XG59O1xuXG5hcGkuYXBwZW5kID0gZnVuY3Rpb24gKGVsZW0sIHRhcmdldCkge1xuICBpZiAobWFuaXB1bGF0aW9uR3VhcmQoZWxlbSwgdGFyZ2V0LCBhcGkuYXBwZW5kKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBlbGVtLmFwcGVuZENoaWxkKHRhcmdldCk7XG59O1xuXG5hcGkucHJlcGVuZCA9IGZ1bmN0aW9uIChlbGVtLCB0YXJnZXQpIHtcbiAgaWYgKG1hbmlwdWxhdGlvbkd1YXJkKGVsZW0sIHRhcmdldCwgYXBpLnByZXBlbmQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsZW0uaW5zZXJ0QmVmb3JlKHRhcmdldCwgZWxlbS5maXJzdENoaWxkKTtcbn07XG5cbmFwaS5iZWZvcmUgPSBmdW5jdGlvbiAoZWxlbSwgdGFyZ2V0KSB7XG4gIGlmIChtYW5pcHVsYXRpb25HdWFyZChlbGVtLCB0YXJnZXQsIGFwaS5iZWZvcmUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChlbGVtLnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbGVtLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRhcmdldCwgZWxlbSk7XG4gIH1cbn07XG5cbmFwaS5hZnRlciA9IGZ1bmN0aW9uIChlbGVtLCB0YXJnZXQpIHtcbiAgaWYgKG1hbmlwdWxhdGlvbkd1YXJkKGVsZW0sIHRhcmdldCwgYXBpLmFmdGVyKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWxlbS5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0YXJnZXQsIGVsZW0ubmV4dFNpYmxpbmcpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYW5pcHVsYXRpb25HdWFyZCAoZWxlbSwgdGFyZ2V0LCBmbikge1xuICB2YXIgcmlnaHQgPSB0YXJnZXQgaW5zdGFuY2VvZiBEb21pbnVzO1xuICB2YXIgbGVmdCA9IGVsZW0gaW5zdGFuY2VvZiBEb21pbnVzO1xuICBpZiAobGVmdCkge1xuICAgIGVsZW0uZm9yRWFjaChtYW5pcHVsYXRlTWFueSk7XG4gIH0gZWxzZSBpZiAocmlnaHQpIHtcbiAgICBtYW5pcHVsYXRlKGVsZW0sIHRydWUpO1xuICB9XG4gIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuXG4gIGZ1bmN0aW9uIG1hbmlwdWxhdGUgKGVsZW0sIHByZWNvbmRpdGlvbikge1xuICAgIGlmIChyaWdodCkge1xuICAgICAgdGFyZ2V0LmZvckVhY2goZnVuY3Rpb24gKHRhcmdldCwgaikge1xuICAgICAgICBmbihlbGVtLCBjbG9uZVVubGVzcyh0YXJnZXQsIHByZWNvbmRpdGlvbiAmJiBqID09PSAwKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4oZWxlbSwgY2xvbmVVbmxlc3ModGFyZ2V0LCBwcmVjb25kaXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYW5pcHVsYXRlTWFueSAoZWxlbSwgaSkge1xuICAgIG1hbmlwdWxhdGUoZWxlbSwgaSA9PT0gMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvbmVVbmxlc3MgKHRhcmdldCwgY29uZGl0aW9uKSB7XG4gIHJldHVybiBjb25kaXRpb24gPyB0YXJnZXQgOiBhcGkuY2xvbmUodGFyZ2V0KTtcbn1cblxuWydhcHBlbmRUbycsICdwcmVwZW5kVG8nLCAnYmVmb3JlT2YnLCAnYWZ0ZXJPZiddLmZvckVhY2goZmxpcCk7XG5cbmZ1bmN0aW9uIGZsaXAgKGtleSkge1xuICB2YXIgb3JpZ2luYWwgPSBrZXkuc3BsaXQoL1tBLVpdLylbMF07XG4gIGFwaVtrZXldID0gZnVuY3Rpb24gKGVsZW0sIHRhcmdldCkge1xuICAgIGFwaVtvcmlnaW5hbF0odGFyZ2V0LCBlbGVtKTtcbiAgfTtcbn1cblxuYXBpLnNob3cgPSBmdW5jdGlvbiAoZWxlbSwgc2hvdWxkLCBpbnZlcnQpIHtcbiAgaWYgKGVsZW0gaW5zdGFuY2VvZiBEb21pbnVzKSB7XG4gICAgZWxlbS5mb3JFYWNoKHNob3dUZXN0KTtcbiAgfSBlbHNlIHtcbiAgICBzaG93VGVzdChlbGVtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dUZXN0IChjdXJyZW50KSB7XG4gICAgdmFyIG9rID0gc2hvdWxkID09PSB2b2lkIDAgfHwgc2hvdWxkID09PSB0cnVlIHx8IHR5cGVvZiBzaG91bGQgPT09ICdmdW5jdGlvbicgJiYgc2hvdWxkLmNhbGwoY3VycmVudCk7XG4gICAgZGlzcGxheShjdXJyZW50LCBpbnZlcnQgPyAhb2sgOiBvayk7XG4gIH1cbn07XG5cbmFwaS5oaWRlID0gZnVuY3Rpb24gKGVsZW0sIHNob3VsZCkge1xuICBhcGkuc2hvdyhlbGVtLCBzaG91bGQsIHRydWUpO1xufTtcblxuZnVuY3Rpb24gZGlzcGxheSAoZWxlbSwgc2hvdWxkKSB7XG4gIGlmIChzaG91bGQpIHtcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxufVxuXG5mdW5jdGlvbiBoeXBoZW5hdGUgKHRleHQpIHtcbiAgdmFyIGNhbWVsID0gLyhbYS16XSkoW0EtWl0pL2c7XG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoY2FtZWwsICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbnZhciBudW1lcmljQ3NzUHJvcGVydGllcyA9IHtcbiAgJ2NvbHVtbi1jb3VudCc6IHRydWUsXG4gICdmaWxsLW9wYWNpdHknOiB0cnVlLFxuICAnZmxleC1ncm93JzogdHJ1ZSxcbiAgJ2ZsZXgtc2hyaW5rJzogdHJ1ZSxcbiAgJ2ZvbnQtd2VpZ2h0JzogdHJ1ZSxcbiAgJ2xpbmUtaGVpZ2h0JzogdHJ1ZSxcbiAgJ29wYWNpdHknOiB0cnVlLFxuICAnb3JkZXInOiB0cnVlLFxuICAnb3JwaGFucyc6IHRydWUsXG4gICd3aWRvd3MnOiB0cnVlLFxuICAnei1pbmRleCc6IHRydWUsXG4gICd6b29tJzogdHJ1ZVxufTtcbnZhciBudW1lcmljID0gL15cXGQrJC87XG5cbmFwaS5nZXRDc3MgPSBmdW5jdGlvbiAoZWxlbSwgcHJvcCkge1xuICB2YXIgaHByb3AgPSBoeXBoZW5hdGUocHJvcCk7XG4gIHZhciByZXN1bHQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKVtocHJvcF07XG4gIGlmIChwcm9wID09PSAnb3BhY2l0eScgJiYgcmVzdWx0ID09PSAnJykge1xuICAgIHJldHVybiAxO1xuICB9XG4gIGlmIChyZXN1bHQuc3Vic3RyKC0yKSA9PT0gJ3B4JyB8fCBudW1lcmljLnRlc3QocmVzdWx0KSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHJlc3VsdCwgMTApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5hcGkuc2V0Q3NzID0gZnVuY3Rpb24gKHByb3BzKSB7XG4gIHZhciBtYXBwZWQgPSBPYmplY3Qua2V5cyhwcm9wcykuZmlsdGVyKGJhZCkubWFwKGV4cGFuZCk7XG4gIGZ1bmN0aW9uIGJhZCAocHJvcCkge1xuICAgIHZhciB2YWx1ZSA9IHByb3BzW3Byb3BdO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSA9PT0gdmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gZXhwYW5kIChwcm9wKSB7XG4gICAgdmFyIGhwcm9wID0gaHlwaGVuYXRlKHByb3ApO1xuICAgIHZhciB2YWx1ZSA9IHByb3BzW3Byb3BdO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFudW1lcmljQ3NzUHJvcGVydGllc1tocHJvcF0pIHtcbiAgICAgIHZhbHVlICs9ICdweCc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBocHJvcCwgdmFsdWU6IHZhbHVlXG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICBtYXBwZWQuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgZWxlbS5zdHlsZVtwcm9wLm5hbWVdID0gcHJvcC52YWx1ZTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9Eb21pbnVzLnByb3RvdHlwZScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XG52YXIgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEVhc3k7XG52YXIgaGFyZENhY2hlID0gW107XG5cbmlmICghd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgYWRkRXZlbnQgPSBhZGRFdmVudEhhcmQ7XG59XG5cbmlmICghd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2dCwgd3JhcChlbGVtZW50LCBldnQsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2dCwgdW53cmFwKGVsZW1lbnQsIGV2dCwgZm4pKTtcbn1cblxuZnVuY3Rpb24gd3JhcHBlckZhY3RvcnkgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIgKG9yaWdpbmFsRXZlbnQpIHtcbiAgICB2YXIgZSA9IG9yaWdpbmFsRXZlbnQgfHwgd2luZG93LmV2ZW50O1xuICAgIGUudGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGUucHJldmVudERlZmF1bHQgID0gZS5wcmV2ZW50RGVmYXVsdCAgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZm4uY2FsbChlbGVtZW50LCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcCAoZWxlbWVudCwgZXZ0LCBmbikge1xuICB2YXIgd3JhcHBlciA9IHVud3JhcChlbGVtZW50LCBldnQsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbGVtZW50LCBldnQsIGZuKTtcbiAgaGFyZENhY2hlLnB1c2goe1xuICAgIHdyYXBwZXI6IHdyYXBwZXIsXG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICBldnQ6IGV2dCxcbiAgICBmbjogZm5cbiAgfSk7XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiB1bndyYXAgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgdmFyIGkgPSBmaW5kKGVsZW1lbnQsIGV2dCwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbGVtZW50LCBldnQsIGZuKSB7XG4gIHZhciBpLCBpdGVtO1xuICBmb3IgKGkgPSAwOyBpIDwgaGFyZENhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgaXRlbSA9IGhhcmRDYWNoZVtpXTtcbiAgICBpZiAoaXRlbS5lbGVtZW50ID09PSBlbGVtZW50ICYmIGl0ZW0uZXZ0ID09PSBldnQgJiYgaXRlbS5mbiA9PT0gZm4pIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRvbSA9IHJlcXVpcmUoJy4vZG9tJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY29yZScpO1xudmFyIERvbWludXMgPSByZXF1aXJlKCcuL0RvbWludXMuY3RvcicpO1xudmFyIHRhZyA9IC9eXFxzKjwoW2Etel0rKD86LVthLXpdKyk/KVxccypcXC8/PlxccyokL2k7XG5cbmZ1bmN0aW9uIGFwaSAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIG5vdFRleHQgPSB0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnO1xuICBpZiAobm90VGV4dCAmJiBhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBjb3JlLmNhc3Qoc2VsZWN0b3IpO1xuICB9XG4gIGlmIChub3RUZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBEb21pbnVzKCk7XG4gIH1cbiAgdmFyIG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaCh0YWcpO1xuICBpZiAobWF0Y2hlcykge1xuICAgIHJldHVybiBkb20ubWFrZShtYXRjaGVzWzFdKTtcbiAgfVxuICByZXR1cm4gYXBpLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQpO1xufVxuXG5hcGkuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICByZXR1cm4gZG9tLnFzYShjb250ZXh0LCBzZWxlY3Rvcik7XG59O1xuXG5hcGkuZmluZE9uZSA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICByZXR1cm4gZG9tLnFzKGNvbnRleHQsIHNlbGVjdG9yKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZU9iamVjdHMgPSB0eXBlb2YgTm9kZSA9PT0gJ29iamVjdCc7XG52YXIgZWxlbWVudE9iamVjdHMgPSB0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdvYmplY3QnO1xuXG5mdW5jdGlvbiBpc05vZGUgKG8pIHtcbiAgcmV0dXJuIG5vZGVPYmplY3RzID8gbyBpbnN0YW5jZW9mIE5vZGUgOiBpc05vZGVPYmplY3Qobyk7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZU9iamVjdCAobykge1xuICByZXR1cm4gbyAmJlxuICAgIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvLm5vZGVOYW1lID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBvLm5vZGVUeXBlID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50IChvKSB7XG4gIHJldHVybiBlbGVtZW50T2JqZWN0cyA/IG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IGlzRWxlbWVudE9iamVjdChvKTtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50T2JqZWN0IChvKSB7XG4gIHJldHVybiBvICYmXG4gICAgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG8ubm9kZU5hbWUgPT09ICdzdHJpbmcnICYmXG4gICAgby5ub2RlVHlwZSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoYSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBpc0NoZWNrYWJsZSAoZWxlbSkge1xuICByZXR1cm4gJ2NoZWNrZWQnIGluIGVsZW0gJiYgZWxlbS50eXBlID09PSAncmFkaW8nIHx8IGVsZW0udHlwZSA9PT0gJ2NoZWNrYm94Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzTm9kZTogaXNOb2RlLFxuICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNDaGVja2FibGU6IGlzQ2hlY2thYmxlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBoeXBoZW5Ub0NhbWVsIChoeXBoZW5zKSB7XG4gIHZhciBwYXJ0ID0gLy0oW2Etel0pL2c7XG4gIHJldHVybiBoeXBoZW5zLnJlcGxhY2UocGFydCwgZnVuY3Rpb24gKGcsIG0pIHtcbiAgICByZXR1cm4gbS50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGh5cGhlblRvQ2FtZWw6IGh5cGhlblRvQ2FtZWxcbn07XG4iXX0=
(9)
});
