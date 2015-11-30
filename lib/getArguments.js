module.exports = getArguments;

// TODO: this needs to be fixed! Parse the toString value of the function /
// class and use an AST representation to pick out the param names. regex is a
// horrible hack.

var FUNCTION_ARGS = /(?:function|constructor)[^\(]*\(([^\)]*)/m;

/**
 * Get the parameter names of a function.
 * @param {Function} f A function.
 * @return {Array.<String>} An array of the argument names of a function.
 */
function getArguments(f)
{
  var ret = [];
  var args = f.toString().match(FUNCTION_ARGS);

  if (args) {
    args = args[1]
      .replace(/[ ]*,[ ]*/, ',')
      .split(',');
    for (var n = 0; n < args.length; n++) {
      var a = args[n].replace(/^\s+|\s+$/g, '');
      if (a) ret.push(a);
    }
  }

  return ret;
}


