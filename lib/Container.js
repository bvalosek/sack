module.exports = Container;

var getArguments = require('typedef').getArguments;
var _            = require('underscore');
var IoCBinding   = require('./IoCBinding.js');

/**
 * Basic dependency resolver / IoC container that allows for the registering of
 * types and instances, as well as auto-guessing constructor and function
 * injecting via parameter names.
 * @constructor
 */
function Container()
{
  /**
   * @type {object.<string,IoCBinding>}
   */
  this._bindings = {};
}

/**
 * Add a new dependency
 * @param {string} name
 * @param {Function|object} source
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
 * Return a maker function
 * @return {function(thing:any): object}
 */
Container.prototype.getFactory = function()
{
  var _this = this;
  return function(thing) {
    return _this.make(thing);
  }
};

/**
 * @param {string} thing
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
 * Where the magic happens
 * @param {IoCBinding} binding
 * @return {object}
 */
Container.prototype._build = function(T, depNames)
{
  var _this = this;
  var deps = _.map(depNames, function(d) { return _this.make(d); });
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
