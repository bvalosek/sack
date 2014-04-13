var test = require('tape');

var Container = require('../lib/Container.js');

test('Double register', function(t) {
  t.plan(1);
  var c = new Container();
  c.register('a', {});
  t.throws(function() {
    c.register('a', {});
  });
});

test('Double register okay as weak', function(t) {
  t.plan(1);
  var c = new Container();
  c.register('a', {}).asWeak();
  c.register('a', {});
  t.pass();
});

test('Cannot resolve', function(t) {
  t.plan(1);
  var c = new Container();
  t.throws(function() {
    c.make('missing');
  });
});
