const fs = require('fs/promises');
const path = require('path');

const _saved = {
  vars: [],
  baseDir: '',
  exclude: [],
};

const LINE_FLAG = {
  code: 0,
  if: 1,
  else: 2,
  endif: 3,
};

const ifRegExp = /^\/\/\s*#if\s*(.*)$/;
const elseifRegExp = /^\/\/\s*#elseif\s*(.*)$/;
const elseRegExp = /^\/\/\s*#else\s*(.*)$/;
const endifRegExp = /^\/\/\s*#endif$/;
const ifdefRegExpMultiLine = new RegExp(`^${ifRegExp.source}`, 'gm');

// if a variable is not defined, exception will be thrown
// if a variable is '', 0, false, undefined, null, NaN, or any other value, it will be considered as false
/*
var vars = {
    TEST1: '', // false
    TEST2: '2',
}
evalExpression(vars, 'TEST1'); // false
evalExpression(vars, 'TEST2'); // true
try {
    evalExpression(vars, 'TEST3'); // exception
} catch {}
evalExpression(vars, "TEST2===`2` && TEST2==='2'"); // true, can't use ["] in the exception
evalExpression(vars, "TEST1 || TEST2"); // true

TODO: define variables if it's not defined?
function extractVariables(expression) {
  // Match words that are not numbers or keywords
  const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  return [...new Set(expression.match(variableRegex) || [])];
}
*/
const evalExpression = (vars, expression) => {
  const variables = Object.freeze({ ...vars });
  const fn = new Function(...Object.keys(variables), 'return eval("' + expression + '")');
  const result = !!fn(...Object.values(variables));
  console.log(`Expression [${expression}], result: ${result}`);
  return result;
};

const processOneFile = async (vars, fpath) => {
  let text = await fs.readFile(fpath, 'utf8');
  if (!ifdefRegExpMultiLine.test(text)) {
    return null;
  }

  let lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let line = '';
  let expression = '';
  let keepLine = true;
  let lineType = LINE_FLAG.code;
  const saveLines = [];
  for (let i = 0; i < lines.length; i++) {
    line = lines[i];

    let matchIf = line.match(ifRegExp);
    let matchElseIf = line.match(elseifRegExp);
    if (matchIf) {
      lineType = LINE_FLAG.if;
      expression = matchIf[1].trim();
    } else if (matchElseIf) {
      lineType = LINE_FLAG.if;
      expression = matchElseIf[1].trim();
    } else if (line.match(elseRegExp)) {
      lineType = LINE_FLAG.else;
    } else if (line.match(endifRegExp)) {
      lineType = LINE_FLAG.endif;
    } else {
      lineType = LINE_FLAG.code;
    }

    if (lineType === LINE_FLAG.if) {
      keepLine = true;
      const result = evalExpression(vars, expression);
      if (!result) {
        keepLine = false;
      }
    }
    if (lineType === LINE_FLAG.else) {
      console.log(`Expression else`);
      keepLine = !keepLine;
    }
    if (lineType === LINE_FLAG.code) {
      if (keepLine) {
        saveLines.push(line);
      }
    }
    if (lineType === LINE_FLAG.endif) {
      keepLine = true;
    }
  }

  text = saveLines.join('\n');
  return text;
};

async function pluginOnLoad(args) {
  let fPath = path.relative(_saved.baseDir, args.path);
  let skip = false;

  for (let filter of _saved.exclude) {
    if (fPath.startsWith(filter)) {
      skip = true;
      break;
    }
  }

  if (skip) {
    return null;
  }

  const text = await processOneFile(_saved.vars, args.path);
  if (text) {
    return {
      contents: text,
      loader: path.extname(args.path).substring(1),
    };
  } else {
    return null;
  }
}

const DEFAULT_EXCLUDE_LIST = ['dist', 'node_modules'];
const DEFAULT_EXTENSION_LIST = ['.js', '.jsx', '.ts', '.tsx'];
module.exports = (
  vars,
  baseDir = process.cwd(),
  exclude = DEFAULT_EXCLUDE_LIST,
  extension = DEFAULT_EXTENSION_LIST
) => {
  _saved.vars = vars;
  _saved.baseDir = baseDir;
  _saved.exclude = exclude;
  const filter = {
    filter: new RegExp(`(${extension.join('|')})$`),
  };
  return {
    name: 'plugin-ifdef',
    setup(build) {
      build.onLoad(filter, pluginOnLoad);
    },
  };
};
