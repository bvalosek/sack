module.exports = Container;

var getArguments = require('typedef').getArguments;
var IoCBinding   = require('./IoCBinding.js');

/**
 * @class
 * Basic dependency resolver / IoC container that allows for the registering of
 * types and instances under string tags.
 *
 * Dependencies are injected to class constructors and closures via parameter
 * name matching
 *
 * ```
 * var Container = require('sack');
 *
 * var container = new Container();
 *
 * container.register('http', MyHttpServer)
 *   .asSingleton();
 *
 * container.register('messenger', new GlobalMessageBus())
 *   .asInstance();
 *
 * ...
 *
 * // http and messenger need to get injected to this class...
 *
 * function MyApp(http, messenger)
 * {
 *   this.http      = http;
 *   this.messenger = messenger;
 * }
 *
 * ...
 *
 * // We can use the container to automatically inject the needed dependencies...
 *
 * container.make(MyApp);
 * ```
 */
function Container()
{
  /**
   * @type {object.<string,IoCBinding>}
   * @private
   */
  this._bindings = {};
}

/**
 * Register a new dependency with this container.
 *
 * Dependencies are either class constructors, closures, or existing objects.
 * The `name` that a dependency is registered under determines what parameter
 * names we need to resolve it out of the container.
 *
 * Use the methods on the returned {@link IoCBinding} instance to further
 * configure how this dependency will be used.
 * @example
 * // Lazily created singleton
 * container.register('service', SomeService)
 *   .asSingleton();
 *
 * // Registering existing objects
 * container.register('http', express())
 *   .asInstance();
 * @param {string} name The tag we want to register this dependency under
 * @param {function|object} source The class constructor, closure, or existing
 * object instance we want to register
 * @return {IoCBinding}
 */
Container.prototype.register = function(name, source)
{
  var existing = this._bindings[name];
  if (existing && !existing.isWeak())
    throw new Error('Cannot override: ' + name);

  // Create the binding with a ref back to the building function
  var _this = this;
  var binding = new IoCBinding(name, source, function(b) {
    return _this._build(b._source, b.getDependencyNames());
  });

  this._bindings[name] = binding;
  return binding;
};

/**
 * Return a factory function that can be used to create objects via class
 * constructors or strings that get built via the container.
 *
 * This allows for passing around a simple factory function to other parts of
 * your application that can use it to build domain objects without having to
 * know about the IoC container API or semantics.
 *
 * This is the preferred way of giving power to a manager-type object to serve
 * as a factory during runtime and let it delegate object creation / resolution
 * to this container transparently.
 *
 * It effectively just provides a wrapper around a call to
 * {@link Container#make}.
 * @example
 * var factory = container.getFactory();
 *
 * var thing = factory(Thing);
 *
 * var thing = factory('thing');
 * @return {function(thing:any): object}
 */
Container.prototype.getFactory = function()
{
  var _this = this;
  return function(thing) {
    return _this.make(thing);
  };
};

/**
 * Resolve an object out of the container via a class constructor, closure, or
 * string tag.
 *
 * When calling this function with a class constructor or closure, the
 * parameters are automatically resolved out of the container as well via their
 * name.
 *
 * If a string is used, the container will create objects directly with their
 * string tag used in  {@link Container#register}
 * @example
 * // "dep1" and "dep2" are first resolved out of the container, and then this
 * // closure is called
 * var thing = container.make(function(dep1, dep2) {
 *   ...
 * });
 *
 * var transport = container.make('transport');
 * @param {function|string} thing A string or class constructor/closure to
 * resolve out of the container.
 * @return {object}
 */
Container.prototype.make = function(thing)
{
  if (typeof thing === 'string') {
    var binding = this._resolve(thing);
    return binding.build();
  }

  if (typeof thing === 'function') {
    var depNames = getArguments(thing);
    return this._build(thing, depNames);
  }

  // Nop if it's not a string dep or a constructor/closure
  return thing;
};

/**
 * Same as {@link Container#make}, but will return null if a dependency is not
 * available.
 *
 * This allows you to attempt to make an optional dependency via tag.
 * @param {string} thing
 * @return {object}
 */
Container.prototype.makeOrNull = function(thing)
{
  if (typeof thing !== 'string')
    throw new TypeError('thing');

  if (!this.tagExists(thing))
    return null;

  return this.make(thing);
};

/**
 * Determine if something has been registered with a given tag.
 * @param {string} tag Tag to check for existing registered dependency
 * @return {boolean}
 */
Container.prototype.tagExists = function(tag)
{
  return !!this._bindings[tag];
};

/**
 * Where the magic happens
 * @param {IoCBinding} T
 * @param {array.<string>} depNames
 * @return {object}
 * @private
 */
Container.prototype._build = function(T, depNames)
{
  var deps = [];
  for (var n = 0; n < depNames.length; n++) {
    var d = depNames[n];
    deps.push(this.make(d));
  }
  return callNew(T, deps);
};

/**
 * Resolve information about a dependency.
 * @param {String} name The dependency name.
 * @return {IoCBinding} Information about this named dependency.
 * @private
 */
Container.prototype._resolve = function(name)
{
  var binding = this._bindings[name];
  if (!binding)
    throw new Error(
      'Cannot resolve dependency "' + name + '"');
  return binding;
};

/**
 * Give us a way to instantiate a new class with an array of args
 * @private
 */
function callNew(T, args)
{
  function F() { return T.apply(this, args); }
  F.prototype = T.prototype;
  return new F();
}
