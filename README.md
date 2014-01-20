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

## Introduction

This is a simple *Inversion of Control Container*. It provides the mechanism
you need to have a centralized store of object instances that other types can
passive request get injected.

This means that you can have objects use, access, or compose other objects
without having to explicitly know how to create / setup / initialize them.

It lets you have a highly-decoupled and framework-independent domain objects.

## Usage

Dependencies are all managed via a `Container` instance:

```javascript
var Container = require('sack').Container;

...

var container = new Container();
```

### Registering Objects

Register a class constructor that will get executed every time the dependency
is resolved, creating a new instance:

```javascript
container.register('service', MyService);
```

Register a constructor function that will get executed *one time* when the
first time a dependency is resolved, and then re-used after that (singleton):

```javascript
container.shared('service', MyService);
```

Register an existing object instance as a dependency:

```javascript
container.register('service', someService);
```

Register a (lazily evaluated) callback to provide the dependency on every
request:

```javascript
container.register('service', function() {
  return new MyService();
});
```

Registered a callback to provide the dependency the first time it is requested,
and then re-use it all subsequent times (singleton via callback):

```javascript
container.shared('service', function() {
  return new MyService();
});

```

Register a factory callback for a specific class constructor. This is useful
for allowing objects to create several of another object without explictly
knowing how:

```javascript
container.registerFactory(GameEntity, function(pool) {
  return pool.aquire(GameEntity);
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


