# insert-rule

> Insert rules into a stylesheet programatically with a simple API

# Install

Using Bower

```shell
bower install -S insert-rule
```

Using `npm`

```shell
npm install -S insert-rule
```

# `insertRule(selector, styles)`

Applies the styles to the selector. The selector can be any CSS selector. That includes `:after` and `:before`, too. Styles can either be plain text or an object. Keys in `camelCase` get converted into `css-case`.

##### Example

```js
insertRule('body:after', 'font-weight: bold;');
```

```js
insertRule('body:after', {
  content: 'Ha-ha!',
  display: 'block',
  fontSize: '16px'
});
```

# License

MIT
