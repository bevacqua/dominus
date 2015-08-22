![dominus.png][5]

> Lean DOM Manipulation

This isn't a drop-in replacement for jQuery, but rather a different implementation. Dominus is **jQuery minus the cruft**, with a footprint of **~4kB** minified and gzipped, vs the **~33kB** in jQuery. Dominus uses [`sektor`][1] as its selector engine of choice, which is a drop-in replacement for [Sizzle][4], but tens of times smaller in exchange for a more limited feature-set.

Just like with jQuery, Dominus exposes a rich API that's chainable to the best of its ability. The biggest difference with jQuery at this level is that the `Dominus` wrapper is a real array. These arrays have been modified to include a few other properties in their prototype, but they don't change the native DOM array. [See `poser` for more details on that one.][3] All of this means you can `.map`, `.forEach`, `.filter`, and all of that good stuff that you're used to when dealing with JavaScript collections, and at the same time you get some extra methods just like with jQuery.

# Install

Using Bower

```shell
bower install -S dominus
```

Using `npm`

```shell
npm install -S dominus
```

# API

The API in Dominus begins with the methods listed below, which allow you to grab an object instance.

## Static Methods

These are the static methods provided by Dominus. Consider these _the entry point_, just like the methods exposed by jQuery on `$`.

### `dominus()`

Returns an empty `Dominus` collection.

### `dominus(HTMLElement)`

Wraps the [`HTMLElement`][2] object in a `Dominus` collection.

### `dominus(Dominus)`

Returns the `Dominus` collection, as-is.

### `dominus(Array)`

Returns a `Dominus` collection with the [`HTMLElement`][2] objects found in the provided array.

### `dominus('<{tag-name}>')`

Returns a `Dominus` collection after creating an element of the provided tag type name.

### `dominus(selector, context?)`

See `dominus.find` below.

### `dominus.find(selector, context?)`

Queries the DOM for the provided selector, using [`sektor`][1]. Returns a `Dominus` collection with [`HTMLElement`][2] objects. If `context` is provided then the search is restricted to children of `context`. The `context` can be either a DOM element, a selector string, or a Dominus object (the first DOM element in the group is used).

### `dominus.findOne(selector, context?)`

Queries the DOM for the provided selector, using [`sektor`][1]. Returns the first matching [`HTMLElement`][2] object, if any. If `context` is provided then the search is restricted to children of `context`. The `context` can be either a DOM element, a selector string, or a Dominus object (the first DOM element in the group is used).

### `dominus.custom(name, type, filter)`

See [Custom Event Filters](#custom-event-filters) below.

## Instance Methods

Once you've gotten yourself a `Dominus` collection, there's a few more methods you'll get access to. I'll denote array instances as `a`, where possible.

_First off, there's the selection methods._

## Navigation API

These methods let you search the DOM for the nodes that you want to manipulate.

### `a.prev(selector?)`

Returns the previous sibling, optionally filtered by a `selector`.

### `a.next(selector?)`

Returns the next sibling, optionally filtered by a `selector`.

### `a.parent(selector?)`

Returns the first parent element, optionally filtered by a `selector`.

### `a.parents(value?)`

Returns all parent elements, optionally filtered by another Dominus collection, a DOM element, or a selector.

### `a.children(value?)`

Like `.find`, but only one level deep. Optionally filtered by another Dominus collection, a DOM element, or a selector.

### `a.find(selector)`

Queries the DOM for children of the elements in the array, using the provided selector. Returns a single `Dominus` collection containing all of the results.

### `a.findOne(selector)`

Queries the DOM for children of the elements in the array, using the provided selector. Returns the first matching [`HTMLElement`][2] object, if any.

### `a.where(selector)`

Returns a subset of the elements in the array that match the provided selector.

### `a.is(selector)`

Returns whether at least one of the elements in the array match the provided selector.

_Then there's also the attribute manipulation API._

## Attribute Methods

These methods let you modify DOM element attributes or properties.

### `a.html(value?)`

If a `value` is provided then every element in the `Dominus` collection gets assigned that HTML `value`, then `a` is returned for chaining. If you don't provide a `value`, you get the HTML contents of the first node in the `Dominus` collection back.

### `a.text(value?)`

If a `value` is provided then every element in the `Dominus` collection gets assigned that plain text `value`, then `a` is returned for chaining. If you don't provide a `value`, you get the plain text contents of the first node in the `Dominus` collection back. In the case of elements that can be `checked`, the native `value` property is used instead.

### `a.value(value?)`

If a `value` is provided then every element in the `Dominus` collection gets assigned that input `value`, then `a` is returned for chaining. If you don't provide a `value`, you get the input value of the first node in the `Dominus` collection back. In the case of elements that can be `checked`, the native `checked` property is used instead.

### `a.attr(name)`

The `name` attribute's value is returned, for the first element in the collection.

### `a.attr(name, value)`

Every element in the collection gets assigned `value` to the attribute property `name`. Passing `null` or `undefined` as the `value` will remove the attribute from the DOM element entirely.

### `a.attr(attributes)`

The `attributes` map is used to assign every property-value pair to the attributes in every element.

### `a.addClass(value)`

Adds `value` to every element in the collection. `value` can either be a space-separated class list or an array.

### `a.removeClass(value)`

Removes `value` from every element in the collection. `value` can either be a space-separated class list or an array.

### `a.setClass(value)`

Sets `value` for every element in the collection. `value` can either be a space-separated class list or an array.

### `a.hasClass(value)`

Returns `true` if at least one of the elements in the collection matches every class in `value`. `value` can either be a space-separated class list or an array.

### `a.css(prop)`

Gets the CSS property value for `prop` from the first element in the set of matched elements. `camelCase` gets converted into `hyphen-case`.

### `a.css(prop, value)`

Sets the CSS property value for `prop` to `value` for every element in the set of matched elements. `camelCase` gets converted into `hyphen-case`.

### `a.css(props)`

Sets the CSS property values for every element in the set of matched elements using the provided `props` map. `camelCase` gets converted into `hyphen-case`.

Example:

```js
dominus('body').css({ color: 'blue', width: 600 });
```

_You can physically alter the DOM, using the methods listed in the next category._

## DOM Manipulation

### `a.on(type, filter?, fn)`

Attaches the event handler `fn` for events of type `type` on every element in the `Dominus` collection. You can also pass in a list of event types, such as `click dragstart`, and both events get the event listener attached to them.

The `filter?` argument is optional, and you can use it to provide a selector that will filter inputs. This is known as event delegation. The example below will bind a single event listener that will fire only when child nodes matching the `.remove` selector are clicked.

```js
dominus('.products').on('click', '.remove', removeProduct);
```

### `a.once(type, filter?, fn)`

Meant for when you want to listen for an event only once. This method is identical to `a.on(type, filter?, fn)`, except the event listener will be removed right before your `fn` callback is executed.

### `a.off(type, filter?, fn)`

Turns off event listeners matching the event `type`, the `filter` selector _(if any)_, and the event handler.

### `a.emit(type)`

Fabricates a synthetic event of type `type` and dispatches it for each element in the collection. Note that these events are even accessible outside of Dominus.

```js
var el = document.getElementById('dollars');
el.addEventListener('dollarsigns', function () {
  alert('$$$');
});
$(el).emit('dollarsigns');
```

### Custom Event Filters

Dominus allows you to create custom sub-events. For example, you could have a custom click sub-event that only triggers on left clicks; or a custom key press event that only triggers when certain keys are pressed.

Dominus ships with the following custom events.

Event          | Description
---------------|-----------------------------------------------------------
`'left-click'` | Only triggers when a left click happens while no meta keys are pressed (<kbd>Command</kbd>, <kbd>Control</kbd>)

You can register your own custom events using `dominus.custom`.

#### `dominus.custom(name, type, filter)`

Register a custom event named `name`. This event will trigger whenever a `type` event triggers, but only if `filter(e)` returns `true`.

As an illustrative example, here's how the `left-click` custom event is registered.

```js
dominus.custom('left-click', 'click', function (e) {
  return e.which === 1 && !e.metaKey && !e.ctrlKey;
});
```

Adding or removing event listeners to custom event filters is no different from adding or removing regular event listeners.

```js
$('#home').on('left-click', navigateHome);
```

### `a.focus()`

Invokes [`HTMLElement.focus()`][6] on the first DOM element in the collection.

### `a.clone()`

Returns a deep clone of the DOM elements in the collection.

### `a.remove()`

Removes the selected elements from the DOM.

### `a.append(elem)`

Inserts the provided `elem` as the last child of each element in the collection.

### `a.appendTo(elem)`

Inserts every element in the collection as the last children of the provided `elem`.

### `a.prepend(elem)`

Inserts the provided `elem` as the first child of each element in the collection.

### `a.prependTo(elem)`

Inserts every element in the collection as the first children of the provided `elem`.

### `a.before(elem)`

Inserts the provided `elem` as the previous sibling of each element in the collection.

### `a.after(elem)`

Inserts the provided `elem` as the next sibling of each element in the collection.

### `a.beforeOf(elem)`

Inserts every element in the collection as the previous siblings of the provided `elem`.

### `a.afterOf(elem)`

Inserts every element in the collection as the next siblings of the provided `elem`.

The methods listed below affect the collection itself

## Dominus Collection Methods

Besides the fact that `Dominus` is an [out-of-context `Array` object][3], meaning you can do all the fun functional programming you're used to, there's a few more methods to manipulate the collection itself.

### `a.and(...)`

Adds the result of calling [`dominus()`](#dominus-1) with the arguments you provided to the current collection.

This means that you can use `.and` with selectors, a DOM element, an array of DOM elements, or another Dominus collection.

### `a.but(...)`

Removes the result of calling [`dominus()`](#dominus-1) with the arguments you provided from the current collection.

This means that you can use `.but` with selectors, a DOM element, an array of DOM elements, or another Dominus collection.

### `a.i(index)`

Returns the element at index `index`, wrapped in a Dominus object. If the `index` is out of bounds then an empty Dominus collection will be returned.

# License

MIT

[1]: https://github.com/bevacqua/sektor
[2]: https://developer.mozilla.org/en/docs/Web/API/HTMLElement
[3]: https://github.com/bevacqua/poser
[4]: https://github.com/jquery/sizzle
[5]: https://raw.githubusercontent.com/bevacqua/dominus/master/resources/dominus.png
[6]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.focus
