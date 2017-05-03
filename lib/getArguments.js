var babylon = require('babylon');

module.exports = getArguments;

/**
 * Get the parameter names of a function.
 * @param {Function} f A function.
 * @return {Array.<String>} An array of the argument names of a function.
 */
function getArguments(f, amended)
{
  var functionCode = f.toString();
  if(amended){
    functionCode = 'var a=' + functionCode;
  }
  try{
    var ast = babylon.parse(functionCode);
    var functionDecl = findFunctionDecl(ast);

    if(!functionDecl) return [];

    return functionDecl.params.map(p => p.name);
  }catch(e){
    //try one more time
    if(!amended){
      return getArguments(f, true);
    }

    throw new Error('Could not parse:\n' + functionCode + '\n' + e);
  }
}

function findFunctionDecl(ast){
  if(!ast) return null;

  // 'constructor' types
  if(ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression' || ast.type === 'ClassMethod'){
    return ast;
  }
  var nextNode = null;
  switch(ast.type){
    case 'File':
      nextNode = ast.program;
      break;
    case 'Program':
      nextNode = ast.body[0];
      break;
    case 'VariableDeclaration':
      nextNode = ast.declarations[0];
      break;
    case 'VariableDeclarator':
      nextNode = ast.init;
      break;
    case 'ClassDeclaration':
      nextNode = ast.body;
      break;
    case 'ClassBody':
      nextNode = ast.body.find(b => b.kind === 'constructor');
      break;
  }

  return findFunctionDecl(nextNode);
}

