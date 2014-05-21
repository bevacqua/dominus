# domu

> Lean DOM Manipulation

# Install

Using Bower

```shell
bower install -S domu
```

Using `npm`

```shell
npm install -S domu
```

# `domu(elem?, selector)`

Queries the DOM for the provided selector. If `elem` is provided then the search is restricted to children of `elem`. Otherwise `document` is used. Plain DOM elements returned. No fancy wrappers are used.

# `domu.one(elem?, selector)`

Queries the DOM for the provided selector. If `elem` is provided then the search is restricted to children of `elem`. Otherwise `document` is used. A single DOM element is returned. No fancy wrappers are used.

##### Example

```js
domu('body');
// <- document.body
```

# License

MIT
