# v5.0.6 Cross Breed

- Updated `crossvent` to `1.5.4`
- Updated `sektor` to `1.1.4`

# v5.0.3 Cross Breed

- Updated `sektor` to `1.1.3`

# v5.0.2 Cross Breed

- Updated `crossvent` to `1.5.0`

# v5.0.0 Hide and Seek

- Removed `.show` and `.hide` methods

# v4.0.0 Table of Contents

- Changed `$('div').i(index)` so that if the index is out of bounds the returned Dominus collection is empty rather than have an `undefined` element in it

# v3.3.0 North Pole

- Added `.once` method to bind disposable event listeners

# v.3.2.4 Cross Polinize

- Updated `crossvent` to `1.3.1`

# v3.2.3 Interdependant Polinization

- Extracted `./events` into its own module, `crossvent`

# v3.2.1 Proper Attribution

- Fixed a bug where calling `.attr(name, null)` wouldn't remove the `name` attribute from DOM elements

# v3.2.0 Event Emission

- Added `.emit` method to fabricate and raise DOM events

# v3.1.0 Sanity Check

- Fixed behavior of `Array.prototype.slice` on Dominus arrays
- Introduced ability to interact with `Window` object in `$(window)`
- The dynamic versions of `.show` and `.hide` now receive an element as a parameter
- Fixed a bug where DOM manipulation events would throw native browser errors

# v3.0.1 Custom Events

- Introduced custom events

# v2.5.2 Zen Focus

- Added `.focus` method on Dominus objects

# v2.5.1 Attribute Master

- Allows you to use `.attr(attributes)` with an object map and many attributes

# v2.4.4 Brothers and Sisters

- Introduced `.css(prop, value)` method that also allows `.css({ prop: value })`
- Fixed issues with `prev` and `next` where they would've incorrectly return an empty set

# v2.3.7 Set Interpeter

- Introduced ability to pass classes as a single string to `.setClass()`

# v2.3.5 Fat Trimmer

- Removed dependency on `lodash.find`

# v2.3.4 Haystack

- Added `.i(index)` method

# v2.3.4 Parallel Processing

- Override `.map` and `.filter` so that they always return a Dominus array

# v2.3.0 Energy Flux

- Fixed a bug where mapping and filtering resulted in Dominus arrays being demoted to regular arrays in mobile browsers

# v2.2.2 Feet Flight

- Fix issue where removing events failed in old browsers

# v2.2.1 Cupboard

- Bumped `poser` to `1.2.0`

# v2.1.3 Switchboard

- Use Node implementation of `poser`

# v2.1.1 Campus Lantern

- Bumped `poser` to `1.1.5`

# v2.1.0 Keen Listener

- Delegated events now match the event target as well as any parents that are also children of the delegate root

# v2.0.11 Relatives

- Improved `.children` and `.parents`, now able to filter by other collections or DOM elements

# v2.0.10 Class Hierarchy

- Fixed a bug where `.addClass` would replace the existing `className` values with the newer ones

# v2.0.9 Show and Tell

- Included `.hide` and `.show` methods with a rich API

# v2.0.8 Questionable Tactics

- Fixed a bug where `.and`, `.but` API methods weren't chaining

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
