module.exports = IoCBinding;

var getArguments = require('typedef').getArguments;

/**
 * Will be created during {@link Container#register} calls, and should not be
 * instantiated directly.
 * @param {string} name Tag of the dependency
 * @param {object} source Source function/object
 * @param {function(name:string): object} factory Builder
 * @class
 * A binding object used to handle configuring IoC bindings.
 */
function IoCBinding(name, source, factory)
{
  this._name        = name;
  this._source      = source;
  this._factory     = factory;
  this._cached      = typeof source !== 'function' ?  source : null;

  // Resolved on first build
  this._deps        = null;

  this._weak        = false;
  this._singleton   = false;
}

/**
 * Allow a binding to be overridden at a later time.
 *
 * Marking a binding as weak will let it get overridden but a subsequent
 * binding without throwing an error.
 * @return {IoCBinding} This binding.
 * @example
 * container.register('config', MemoryStoreConfig);
 *   .asWeak();
 *
 * ...
 *
 * // Would normally throw an error, but is okay since it was registered as
 * // weak above. Notice that since this new dependency was not registered as
 * // weak, if it overridden again it WILL throw an error this time.
 * container.register('config', LocalStorageConfig);
 */
IoCBinding.prototype.asWeak = function()
{
  this._weak = true;
  return this;
};

/**
 * Determine if a binding is currently set as weak
 * @return {boolean}
 */
IoCBinding.prototype.isWeak = function()
{
  return this._weak;
};

/**
 * Get a list of all the names of dependencies needed to resolve this binding.
 *
 * If the source is a class constructor or closure, it'll be the named
 * parameters. Otherwise it'll be an empty array.
 * @return {array.<string>}
 */
IoCBinding.prototype.getDependencyNames = function()
{
  if (this._deps)
    return this._deps;

  if (typeof this._source === 'function') {
    this._deps = getArguments(this._source);
  } else {
    this._deps = [];
  }

  return this._deps;
};

/**
 * Mark this dependency to be instantiated only once.
 *
 * This will allow a dependency to only actually be resolved and created a
 * single time, after which that instance is cached and re-used for all
 * subsequent requests.
 *
 * This is how you would implement a "global singleton" pattern without the
 * consumer of the dependency necessarily knowing that.
 * @return {IoCBinding} This binding.
 * @example
 * container.register('http', MyHttpServer)
 *   .asSingleton();
 *
 * var s1 = container.make('http');
 * var s2 = container.make('http');
 *
 * s1 === s2; // true
 */
IoCBinding.prototype.asSingleton = function()
{
  this._singleton = true;
  return this;
};

/**
 * Use the source object directly as the dependency.
 *
 * This is used to signal that we should simply recall the dependency directly
 * that we've registered with a container.
 *
 * This is typically used either to register plain objects to the container, or
 * to register instantiated classes that require a little extra setup at run
 * time.
 * @return {IoCBinding} This binding.
 * @example
 * container.register('configs', { ... })
 *   .asInstance();
 *
 * ...
 *
 * var configs = container.make('configs');
 */
IoCBinding.prototype.asInstance = function()
{
  // Fill the cache with our source
  this._cached = this._source;
  return this;
};

/**
 * Create the dependency.
 * @return {object}
 */
IoCBinding.prototype.build = function()
{
  if (this._cached)
    return this._cached;

  // Build and stash it if it's a singleton
  var thing = this._factory(this);
  if (this._singleton)
    this._cached = thing;

  return thing;
};

