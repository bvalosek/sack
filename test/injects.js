var test = require('tape');
var Container = require('../lib/Container.js');

test('Instance injects', function(t) {
  t.plan(1);

  var c = new Container();
  var val = {};

  function T() { }

  c.registerConstructor('t', T);
  c.registerInjects(T, { prop: val });

  var instance = c.make('t');

  t.strictEqual(instance.prop, val);
  
});
