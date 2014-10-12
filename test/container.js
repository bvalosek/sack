var test = require('tape');

var Container = require('../lib/Container.js');

test('Basic single dep constructor registration', function(t) {
  t.plan(1);

  var r = new Container();
  var x = 't';
  var T = function T() {};

  r.register(x, T);
  t.strictEqual(r.make(x).constructor, T, 'Make returns instance');

});

test('Basic dep track', function(t) {
  t.plan(5);

  var r = new Container();
  var A = function() { t.ok(true, 'A ctor fired'); };
  var B = function() { t.ok(true, 'B ctor fired'); };
  var T = function T(a, b) {
    t.ok(true, 'T ctor fired');
    t.strictEqual(true, a instanceof A, 'A passed in');
    t.strictEqual(true, b instanceof B, 'B passed in');
  };

  r.register('t', T);
  r.register('b', B);
  r.register('a', A);

  r.make('t');

});

test('Make from ctor', function(t) {
  t.plan(2);

  var r = new Container();
  function T(a) {
    t.strictEqual(true, a instanceof A, 'a passed in');
  }
  function A() { t.ok(true, 'A ctor fired'); }

  r.register('a', A);
  r.make(T);

});

test('Singletons', function(t) {
  t.plan(2);

  var r = new Container();
  function T() { t.ok(true, 'T ctor fired'); }
  r.register('t', T).asSingleton();

  t.strictEqual(r.make('t'), r.make('t'), 'Same instance created');

});

test('Singleton as a dep', function(t) {
  t.plan(2);

  var r = new Container();
  function T(a) {
    t.ok(true, 'T ctor called');
  }

  function A() {
    t.ok(true, 'A ctor called');
  }

  r.register('a', A);
  r.register('t', T).asSingleton();

  r.make('t');
  r.make('t');

});


test('Nop', function(t) {
  t.plan(1);

  var r = new Container();
  var weird = {};

  t.strictEqual(r.make(weird), weird, 'identity transform');

});


test('Using closures', function(t) {
  t.plan(3);

  var r = new Container();
  var DEP = {};
  var B_DEP = {};

  r.register('dep', function() {
    return DEP;
  });

  t.strictEqual(r.make('dep'), DEP, 'no deps');

  function A() { }
  r.register('a', A);
  r.register('b', function() {
    return B_DEP;
  });
  r.register('c', function(a, b) {
    return { a: a, b: b };
  });

  t.ok(r.make('c').a instanceof A, 'a instantiated');
  t.strictEqual(r.make('c').b, B_DEP, 'b corret');

});

test('Registering instances', function(t) {
  t.plan(2);

  var thing = {};

  var r = new Container();
  r.register('a', thing);
  t.strictEqual(thing, r.make('a'), 'making returns instance');
  t.strictEqual(thing, r.make('a'), 'making returns same instance');

});

test('factory is just like make', function(t) {
  t.plan(1);

  var r = new Container();
  var x = 't';
  var T = function T() {};

  r.register(x, T);
  t.strictEqual(r.getFactory()(x).constructor, T, 'Make returns instance');
});

test('tag exists function', function(t) {
  t.plan(3);

  var r = new Container();
  t.strictEqual(false, r.tagExists('shit'));

  r.register('abc', 123).asInstance();

  t.strictEqual(true, r.tagExists('abc'));
  t.strictEqual(false, r.tagExists('shit'));

});

test('make or null', function(t) {
  t.plan(5);

  var r = new Container();
  t.strictEqual(null, r.makeOrNull('booboo'));

  t.throws(function() { r.makeOrNull({}); });
  t.throws(function() { r.makeOrNull(); });
  t.throws(function() { r.makeOrNull(function T() { }); });

  r.register('abc', 123).asInstance();
  t.strictEqual(123, r.makeOrNull('abc'));

});
