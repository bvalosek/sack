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

## Rationale

This is a simple *Inversion of Control Container*. It provides the mechanism
you need to have a centralized store of object instances that other types can
passive request get injected.

This means that you can have objects use, access, or compose other objects
without having to explicitly know how to create / setup / initialize them.

It lets you have a highly-decoupled and framework-independent domain objects.

## Usage

The functionality of Sack lies within its `Container` class.

### Registering Objects

Register a dependency with a container with a stringly-typed tag and either a
constructor, instance, or closure.

```javascript
var Container = require('sack').Container;

var container = new Container();

// Create a new instance every request:
container.register('service', MyService);

// Create a new instance on first request, then reuse (singleton-esque):
container.shared('service', MyService);

// Use an existing instance:
container.register('service', new Service());

// Have a (lazily evaluated) callback provide the dependency every request
container.register('service', function() {
  return new MyService();
});

// Use a callback to provide the dependency, but only once (singleton):
container.shared('service', function() {
  return new MyService();
});

```

### Resolving Objects

You can create / request objects via the `make()` function.

```javascript
var service = container.make('service');
```

### Expressing Dependencies

Whenever Sack creates an object, it satisfies that object's dependencies by
resolving them out of the container as well.

An object expresses its dependency as a constructor parameter, whose name must
match a registered object.

```javascript
function UserEditController(users)
{
  this.users = users;
}

UserEditController.prototype.refreshUsers()
{
  this.users.refresh();
}
```

Assuming we have registered some implementation for `users`:

```javascript
container.register('users', new LocalStorageUsers());
```

Then making `UserEditController` via the container will resolve the dependency
automatically.

```
var controller = container.make(UserEditController);
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


