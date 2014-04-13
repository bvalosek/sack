var test = require('tape');

var IoCBinding = require('../lib/IoCBinding.js');

test('Fluent style returns', function(t) {
  t.plan(3);
  var b;
  t.strictEqual((b = new IoCBinding()).asInstance(), b);
  t.strictEqual((b = new IoCBinding()).asWeak(), b);
  t.strictEqual((b = new IoCBinding()).asSingleton(), b);
});

test('Cached dep names', function(t) {
  t.plan(2);
  var b = new IoCBinding();
  t.strictEqual(b.getDependencyNames(), b.getDependencyNames());

  var c = new IoCBinding('a', function(a, b, c) { });
  t.strictEqual(c.getDependencyNames(), c.getDependencyNames());
});

