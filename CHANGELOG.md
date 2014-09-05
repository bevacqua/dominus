# v2.0.7 Parental Advise

- Replaced internal instances of `.parentNode` with `.parentElement` to avoid hitting the `#document` node

# v2.0.6 Context King

- You can now pass a context by using a selector, a Dominus object, or a DOM element

# v2.0.5 Bumpy Road

- Bumped `sektor` to 1.1.1, see [its changelog][1] for fixes
- Improved internal build process, automated footprint comparison

# v2.0.0 Mortal Kombat

- Dropped `Sizzle` in favor of `sektor`, which is much smaller

# v1.6.0 Beat the Bush

- Introduced `.prev`, `.next`, `.parent`, `.parents`, and `.children` methods
- Introduced `.and` and `.but` API methods
- Fixed an issue where you could potentially get duplicate nodes in a Dominus collection

# v1.5.0 Venture Beat

- Introduced event delegation
- Introduced event removal
- Named releases!

# v1.4.0 Right Round

- Implemented `.addClass`, `.removeClass`, `.setClass`, and `.hasClass` methods
- Introduced ability to create elements using the `$('<div>')` API
- Added `.remove` method to remove elements from the DOM
- Included DOM manipulation methods `.append`, `.appendTo`, `.prepend`, `.prependTo`, `.after`, `.afterOf`, `.before`, and `.beforeOf`.
- Added `.clone` method

# v1.3.2 `throw up;`

- Fixed an issue where `.findOne` would throw.

# v1.3.1 Box Office

- Fixed an issue where inputs would be assumed to be checkboxes

# v1.3.0 Where Is Wally?

- Added `.where` instance method
- Added `.is` instance method
- Fixed issues when passing in an array to `$()`
- Resolved issues when using the `.attr` getter

# v1.2.0 _cough_ IE _cough_

- Events now have cross-browser support
- Introduced `.attr` method
- `.text` now sets or gets the value text found on check elements if asked directly
- `.value` now sets or gets the boolean checked property for check elements

# v1.1.5 Bounty Hunter

- Reverted `v1.1.4`

# v1.1.4 Bouncy Castle

- Added `debounce` option to `.on`

# v1.1.0 All The Small Things

- Introduced `.text`, and `.value`
- Improved `.on` to support multi-event binding

# v1.0.0 IPO

- Initial Public Release

[1]: https://github.com/bevacqua/sektor/blob/master/CHANGELOG.md#111-short-circuit
