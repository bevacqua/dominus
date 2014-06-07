# dominus

> Lean DOM Manipulation

# Install

Using Bower

```shell
bower install -S dominus
```

Using `npm`

```shell
npm install -S dominus
```

Dominus is like jQuery, minus the cruft. Dominus uses [`Sizzle`][1] as its selector engine of choice, so you rest assured that the best part of jQuery is also available from Dominus.

# API

Just like with jQuery, Dominus exposes a rich API that's chainable to the best of its ability. The biggest difference with jQuery at this level is that the `Dominus` wrapper is a real array. That means you can `.map`, `.forEach`, `.filter`, and all of that good stuff that you're used to when dealing with JavaScript collections.

## Static Methods

These are the static methods provided by Dominus. Consider these _the entry point_, just like the methods exposed by jQuery on `$`.

### `dominus()`

Returns an empty `Dominus` array.

### `dominus(HTMLElement)`

Wraps the [`HTMLElement`][2] object in a `Dominus` array.

### `dominus(Dominus)`

Returns the `Dominus` array, as-is.

### `dominus(Array)`

Returns a `Dominus` array with the [`HTMLElement`][2] objects found in the provided array.

### `dominus(selector, context?)`

See `dominus.find` below.

### `dominus.find(selector, context?)`

Queries the DOM for the provided selector, using [Sizzle][1]. Returns a `Dominus` array with [`HTMLElement`][2] objects. If `context` is provided then the search is restricted to children of `context`.

### `dominus.findOne(selector, context?)`

Queries the DOM for the provided selector, using [Sizzle][1]. Returns the first matching [`HTMLElement`][2] object, if any. If `context` is provided then the search is restricted to children of `context`.

## Instance Methods

Once you've gotten yourself a `Dominus` array, there's a few more methods you'll get access to. I'll denote array instances as `a`, where possible.

### `a.find(selector)`

Queries the DOM for children of the elements in the array, using the provided selector. Returns a single `Dominus` array containing all of the results.

### `a.findOne(selector)`

Queries the DOM for children of the elements in the array, using the provided selector. Returns the first matching [`HTMLElement`][2] object, if any.


TODO: list all methods

...




# License

MIT

[1]: http://sizzlejs.com/ "Sizzle.js Selector Engine"
[2]: https://developer.mozilla.org/en/docs/Web/API/HTMLElement
