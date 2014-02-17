module.exports = Container;

var getArgs = require('typedef').getArguments;
var getName = require('typedef').getName;
var _       = require('underscore');

/**
 * Basic dependency resolver / IoC container that allows for the registering of
 * types and factories via callback functions, as well as auto-guessing
 * constructor and function injecting via parameter names.
 * @constructor
 */
function Container()
{
  this._types = {};

  // Injected post-instance
  this._injects = [];

  this.register('container', this);
}

/**
 * @param {Function=} T
 * @param {Function=} closure
 * @param {boolean=} shared
 * @param {Object=} instance
 */
function Entry(T, closure, deps, shared, instance)
{
  this.T = T || null;
  this.closure = closure || null;
  this.deps = deps || [];
  this.shared = shared !== undefined ? shared : false;
  this.instance = instance || null;
}

/**
 * Register a class constructor or object instance into the container under a
 * string tag.
 * @param {String} name The name we want register something under.
 * @param {Function} T The class constructor of the type we want to register.
 * @param {boolean=} shared If true, this dep will only be instantiated once (a
 * la singleton).
 */
Container.prototype.register = function(name, T, shared)
{
  if (T instanceof Function)
    return this.registerConstructor(name, T, shared);
  else
    return this.registerInstance(name, T, shared);
};

/**
 * Register an existing object instance into the container under a string tag.
 * @param {String} name The name we want to register this dependency under.
 * @param {Object} instance The object we want returned every time we resolve
 * this dependency.
 */
Container.prototype.registerInstance = function(name, instance)
{
  this._types[name] = new Entry(
    null, null, null, true, instance);
};

/**
 * Register a callback function into the container under a string tag.
 * @param {String} name The name we want to register this dependency under.
 * @param {Function} closure A callback function we want to call when creating
 * this dependency.
 * @param {boolean=} shared If true, this dependency will only be instantiated
 * once (a la singleton).
 */
Container.prototype.registerClosure = function(name, closure, shared)
{
  this._types[name] = new Entry(
    null, closure, getArgs(closure), !!shared, null);
};

/**
 * Register a factory callback function under an object constructor.
 * @param {Function} T Constructor to register.
 * @param {Function} factory Callback function that fires to create the class.
 */
Container.prototype.registerFactory = function(T, factory)
{
  this._types['$$factory_function$$' + getName(T)] = new Entry(
    T, factory, getArgs(factory), false, null);
};

/**
 * Register a constructor function under a string tag. Dependencies are inject
 * via constructor parameters.
 * @param {String} name The name we want to register this dependency under.
 * @param {boolean=} shared If true, this dependency will only be instantiated
 * once (a la singleton).
 */
Container.prototype.registerConstructor = function(name, T, shared)
{
  this._types[name] = new Entry(
    T, null, getArgs(T), !!shared, null);
};

/**
 * Register a singleton (instantiated-once) class constructor dependency into
 * this container.
 * @param {Function} T The class constructor of the type we want to register.
 */
Container.prototype.shared = function(name, T)
{
  return this.register(name, T, true);
};

/**
 * For a given type that comes out of a factory, assign instance properties to
 * it everytime.
 * @param {Function} T The class.
 * @param {Object.<string,*>} injectMap
 */
Container.prototype.registerInjects = function(T, injectMap)
{
  var map = this._getInjectMap(T);
  _.extend(map, injectMap);
};

/**
 * Request the object provided by the container registed under construct T.
 * @param {Function} T Constructor function we want to find the factory for.
 * @return {Object} The dependency.
 */
Container.prototype.factory = function(T)
{
  // Attempt to find our registered class to know how to make it...
  for (var n in this._types) {
    var entry = this._types[n];
    if (entry.T !== T || !entry.closure) continue;
    var deps = this._resolveDeps(entry.deps);
    return entry.closure.call(null, deps);
  }

  // Otherwise fall back to build
  return this.build(T);
};

/**
 * Create a new object T with named dependencies in its constructor resolved.
 * @param {Function} T
 * @return {Object} The dependency.
 */
Container.prototype.build = function(T)
{
  var deps = this._resolveDeps(getArgs(T));
  return this._doInjects(T, callNew(T, deps));
};

/**
 * Create a stringly-named dependency from the container.
 * @param {String} name The string tag of the dependency we want to create.
 * @return {Object} The dependency.
 */
Container.prototype.make = function(name)
{
  // Fall back to call if provided 2 args
  if (arguments.length === 2) {
    return this.call.apply(this, arguments);

  // Fall back to factory if provided a constructor
  } else if (name instanceof Function) {
    return this.factory(name);

  // If not a string (like a rando object), just NOP
  } else if (!_(name).isString()) {
    return name;
  }

  var entry = this._resolve(name);

  // Short circuit if we've already got our object cached
  if (entry.shared && entry.instance) {
    return entry.instance;
  }

  // Resolve all of the expressed dependencies
  var deps = this._resolveDeps(entry.deps);

  // Create
  var instance;
  if (entry.T) {
    instance = this._doInjects(entry.T, callNew(entry.T, deps));
  } else {
    instance = entry.closure.call(null, deps);
  }

  // Stash singleton
  if (entry.shared)
    entry.instance = instance;

  return instance;
};

/**
 * Execute a function in some context, resolving all its parameters as
 * dependencies.
 * @param {Object} context Function execution context.
 * @param {Function} f Function to call.
 * @return {*} Whatever the function returns.
 */
Container.prototype.call = function(context, f)
{
  var deps = this._resolveDeps(getArgs(f));
  return f.apply(context, deps);
};

Container.prototype._doInjects = function(T, instance)
{
  var map = this._getInjectMap(T);
  _.extend(instance, map);
  return instance;
};

/**
 * Get any inject maps for instances based on class T
 * @param {Function} T
 * @return {Object.<String,*>}
 */
Container.prototype._getInjectMap = function(T)
{
  for (var n = 0; n < this._injects.length; n++) {
    var entry = this._injects[n];
    if (entry.T === T)
      return entry.map;
  }

  // New one
  var map = {};
  this._injects.push({T: T, map: map });
  return map;
};

/**
 * Resolve a list of string dependencies into real dependencies
 * @param {Array.<String>} deps
 * @return {Array.<Object>}
 * @private
 */
Container.prototype._resolveDeps = function(deps)
{
  var _this = this;
  return _(deps).map(function(d) { return _this.make(d); });
};

/**
 * Resolve information about a dependency.
 * @param {String} name The dependency name.
 * @return {Entry} Information about this named dependency.
 * @private
 */
Container.prototype._resolve = function(name)
{
  var info = this._types[name];
  if (!info)
    throw new Error(
      'Cannot resolve dependency "' + name + '"');
  return info;
};

// Give us a way to instantiate a new class with an array of args
function callNew(T, args)
{
  function F() { return T.apply(this, args); }
  F.prototype = T.prototype;
  return new F();
}

