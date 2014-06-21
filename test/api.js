var test = require('tape');

var Container  = require('../lib/Container.js');
var IoCBinding = require('../lib/IoCBinding.js');
var sack       = require('../index.js');


test('api test', function(t) {
  t.plan(3);
  t.strictEqual(sack, Container);
  t.strictEqual(sack.Container, Container);
  t.strictEqual(sack.IoCBinding, IoCBinding);
});
