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

# `dominus(selector, context)`

Queries the DOM for the provided selector. If `elem` is provided then the search is restricted to children of `elem`. Otherwise `document` is used. Plain DOM elements returned. No fancy wrappers are used.

# `dominus.one(elem?, selector)`

Queries the DOM for the provided selector. If `elem` is provided then the search is restricted to children of `elem`. Otherwise `document` is used. A single DOM element is returned. No fancy wrappers are used.

##### Example

```js
dominus('body');
// <- document.body
```

# License

MIT
