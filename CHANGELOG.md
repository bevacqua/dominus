# v1.4.0

- Implemented `.addClass`, `.removeClass`, `.setClass`, and `.hasClass` methods
- Introduced ability to create elements using the `$('<div>')` API
- Added `.remove` method to remove elements from the DOM
- Included DOM manipulation methods `.append`, `.appendTo`, `.prepend`, `.prependTo`, `.after`, `.afterOf`, `.before`, and `.beforeOf`.
- Added `.clone` method

# v1.3.2

- Fixed an issue where `.findOne` would throw.

# v1.3.1

- Fixed an issue where inputs would be assumed to be checkboxes

# v1.3.0

- Added `.where` instance method
- Added `.is` instance method
- Fixed issues when passing in an array to `$()`
- Resolved issues when using the `.attr` getter

# v1.2.0

- Events now have cross-browser support
- Introduced `.attr` method
- `.text` now sets or gets the value text found on check elements if asked directly
- `.value` now sets or gets the boolean checked property for check elements

# v1.1.5

- Reverted `v1.1.4`

# v1.1.4

- Added `debounce` option to `.on`

# v1.1.0

- Introduced `.text`, and `.value`
- Improved `.on` to support multi-event binding

# v1.0.0

- Initial Public Release
