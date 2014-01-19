# Sack

[![Build Status](https://travis-ci.org/bvalosek/sack.png?branch=master)](https://travis-ci.org/bvalosek/sack)
[![NPM version](https://badge.fury.io/js/sack.png)](http://badge.fury.io/js/sack)

Inversion-of-control container for all your dependency injection needs.

[![browser support](https://ci.testling.com/bvalosek/sack.png)](https://ci.testling.com/bvalosek/sack)

## Installation

**Sack** is meant to be used with [Browserify](http://browserify.org/), so
install with npm:

```
npm install sack
```

## Tern Support

The source files are all decorated with [JSDoc3](http://usejsdoc.org/)-style
annotations that work great with the [Tern](http://ternjs.net/) code inference
system. Combined with the Node plugin (see this project's `.tern-project`
file), you can have intelligent autocomplete for methods in this library.

## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`.

Automated CI cross-browser testing is provided by
[Testling](http://ci.testling.com/bvalosek/sack).


## License
Copyright 2014 Brandon Valosek

**Sack** is released under the MIT license.


