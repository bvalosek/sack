# Sack

[![Build Status](https://travis-ci.org/bvalosek/sack.png?branch=master)](https://travis-ci.org/bvalosek/sack)
[![NPM version](https://badge.fury.io/js/sack.png)](http://badge.fury.io/js/sack)

An Inversion-of-Control container for all your dependency injection needs.

[![browser support](https://ci.testling.com/bvalosek/sack.png)](https://ci.testling.com/bvalosek/sack)

## Installation

```
npm install sack
```

**Sack** works on both on the server with NodeJS and the client with
[Browserify](http://browserify.org/).

## Introduction

This is a simple *Inversion of Control Container*. It provides the mechanism
you need to have a centralized store of lazily-created, dynamically resolved
object instances that other types can passively request get injected.

This means that you can have objects use, access, or compose other objects
without having to explicitly know how to create/setup/initialize them.

It lets you have a highly-decoupled and framework-independent domain objects.

### Philosophy

As with any IoC container, you want to only have your code be aware of the
container the topmost/single entry point that bootstraps the rest of your
application.

It is very much so an antipattern to have traces of the IoC container all over your
codebase. The idea is to allow your business logic and domain classes to be
**totally unaware** that they are getting injected by a container, keeping them
free of Sack-specific code.

This is done by  embracing and reifying the pattern of *dependency injection
via constructor parameters*. Instead of having all of your objects be aware of
how to find, access, setup, initialize, and manage other objects, they simply
implicitly state their need for a dependency as a constructor parameter.

It allows your business logic classes to go from this:

```javascript
function UserController()
{
  var connection = new DbConnection(global.settings.conConfig);
  this.users = connection.selectUsers();
}
```

To this:

```javascript
function UserController(users)
{
  this.users = users;
}

```

This removes the knowledge and logic from `UserController` on how to connect to
a database.

In large applications, things like model stores, application
configs, service handles, etc. are all used across several different parts of
an application. Relying on every consumer object to manage its dependencies
violates [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) and
[SRP](http://en.wikipedia.org/wiki/Single_responsibility_principle), making
your codebase difficult to maintain as it scales.

The goal is to reduce how tightly coupled your various objects are by removing
the knowledge of *how to create* other dependency objects, and simply rely on
expressing *what kid* of objects we need.


## Usage

Dependencies should be managed from a `Container` instance:

```javascript
var Container = require('sack').Container;

var container = new Container();
```

### Registering Objects

Register a class constructor that will get executed every time the dependency
is resolved, creating a new instance:

```javascript
container.register('service', MyService);
```

Register a constructor function that will get executed *one time* when the
first time the dependency is resolved, and then re-used after that (singleton
pattern):

```javascript
container.register('service', MyService).asSingleton();
```

Register an existing object instance as a dependency:

```javascript
container.register('service', someService).asInstance();
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
container.register('service', function() {
  return new MyService();
}).asSingleton();

```

### Resolving Objects

You can create / request objects via the `make()` function by passing in the
string tag used during registration:

```javascript
var service = container.make('service');
```

Not that you should typically not be using Sack this way, but rather expressing
dependencies as explained below:

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
container.register('users', LocalStorageUsers).asSingleton();
```

Then making `UserEditController` via the container will resolve the dependency
automatically.

```
var controller = container.make(UserEditController);
```

## Architecture Patterns

Sack is not a framework, but it is something that should mostly live at the top
of your application lifecycle.

A typical pattern is to have some bootstrap file (`main.js`) that creates a
`Container`, that then passes it to several *services* that each create and
wire up their own set of dependencies. The services and ONLY the services are
aware of the IoC container.

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


