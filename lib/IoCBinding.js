module.exports = IoCBinding;

var getArguments = require('typedef').getArguments;

/**
 * @constructor
 * @param {string} name
 * @param {object} source
 * @param {function(name:string): object} factory
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
 * @return {IoCBinding} This binding.
 */
IoCBinding.prototype.asWeak = function()
{
  this._weak = true;
  return this;
};

/**
 * @return {boolean}
 */
IoCBinding.prototype.isWeak = function()
{
  return this._weak;
};

/**
 * @return {array.<string>} List of all the dep names needed in the constructor
 * of the source (if we have one)
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
 * @return {IoCBinding} This binding.
 */
IoCBinding.prototype.asSingleton = function()
{
  this._singleton = true;
  return this;
};

/**
 * @return {IoCBinding} This binding.
 */
IoCBinding.prototype.asInstance = function()
{
  // Fill the cache with our source
  this._cached = this._source;
  return this;
};

/**
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

