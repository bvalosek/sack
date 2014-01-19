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

test('Register throws', function(t) {
  t.plan(1);

  var r = new Container();
  var x = 't';
  var T = function T() {};

  r.register(x, T);
  t.throws(function() {
    r.register(x, T);
  }, 'Dupe on register');

});

test('Resolve method throws', function(t) {
  t.plan(1);

  var r = new Container();

  t.throws(function() {
    r._resolve('not there');
  }, 'Missing type');
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

test('Throw on unmet dep', function(t) {
  t.plan(1);

  var r = new Container();
  r.register('T', function(A, B, C) {});
  t.throws(function() {
    r.make('T');
  }, 'no deps');

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
  r.shared('t', T);

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
  r.shared('t', T);

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

test('Self register', function(t) {
  t.plan(2);

  var c = new Container();
  t.strictEqual(c.make('container'), c, 'got em');
  t.strictEqual(c.make('container'), c, 'got em');

});
