import {
  LuaIdentifier,
  LuaLiteral,
  LuaBinaryExpression,
  LuaCallExpression,
  LuaAssignmentExpression,
  LuaLocalDeclaration,
  LuaIfStatement,
  LuaFunctionDeclaration,
  LuaExpressionStatement,
  LuaExpression,
  LuaStatement,
  LuaProgram,
  LuaWhileStatement,
  LuaForStatement,
  LuaReturnStatement,
  LuaUnaryExpression,
} from './types';

const LUA_KEYWORDS = new Set([
  'and',
  'break',
  'do',
  'else',
  'elseif',
  'end',
  'false',
  'for',
  'function',
  'goto',
  'if',
  'in',
  'local',
  'nil',
  'not',
  'or',
  'repeat',
  'return',
  'then',
  'true',
  'until',
  'while',
]);

export function escapeLuaString(value: string): string {
  let result = '';
  for (const ch of value) {
    switch (ch) {
      case '\\':
        result += '\\\\';
        break;
      case '"':
        result += '\\"';
        break;
      case '\n':
        result += '\\n';
        break;
      case '\t':
        result += '\\t';
        break;
      case '\r':
        result += '\\r';
        break;
      default:
        if (ch < ' ') {
          result += '\\' + ch.charCodeAt(0).toString(10).padStart(3, '0');
        } else {
          result += ch;
        }
    }
  }
  return result;
}

export function sanitizeLuaIdentifier(name: string): string {
  let s = name.trim();
  if (!s) return 'var';
  if (/^[0-9]/.test(s)) s = '_' + s;
  s = s.replace(/[^A-Za-z0-9_]/g, '_');
  if (LUA_KEYWORDS.has(s)) s += '_';
  return s;
}

export function id(name: string): LuaIdentifier {
  return { type: 'Identifier', name };
}

export function literal(value: string | number | boolean | null): LuaLiteral {
  let raw: string;
  if (value === null) {
    raw = 'nil';
  } else if (typeof value === 'string') {
    raw = '"' + escapeLuaString(value) + '"';
  } else if (typeof value === 'boolean') {
    raw = value ? 'true' : 'false';
  } else {
    raw = String(value);
  }
  return { type: 'Literal', value, raw };
}

export function binaryOp(
  operator: string,
  left: LuaExpression,
  right: LuaExpression,
): LuaBinaryExpression {
  return { type: 'BinaryExpression', operator, left, right };
}

export function unaryOp(
  operator: string,
  argument: LuaExpression,
): LuaUnaryExpression {
  return { type: 'UnaryExpression', operator, argument };
}

export function call(
  callee: string,
  args: LuaExpression[] = [],
): LuaCallExpression {
  return { type: 'CallExpression', callee: id(callee), arguments: args };
}

export function assign(
  names: string[],
  values: LuaExpression[],
): LuaAssignmentExpression {
  return {
    type: 'AssignmentExpression',
    left: names.map(id),
    operator: '=',
    right: values,
  };
}

export function localDecl(
  names: string[],
  values: LuaExpression[] = [],
): LuaLocalDeclaration {
  return {
    type: 'LocalDeclaration',
    names,
    values,
  };
}

export function ifStmt(
  condition: LuaExpression,
  consequent: LuaStatement[],
  alternate: LuaStatement[] = [],
): LuaIfStatement {
  return { type: 'IfStatement', condition, consequent, alternate };
}

export function funcDecl(
  name: string,
  params: string[],
  body: LuaStatement[],
): LuaFunctionDeclaration {
  return { type: 'FunctionDeclaration', name, params, body };
}

export function exprStmt(expression: LuaExpression): LuaExpressionStatement {
  return { type: 'ExpressionStatement', expression };
}

export function program(body: LuaStatement[]): LuaProgram {
  return { type: 'Program', body };
}

export function whileStmt(
  condition: LuaExpression,
  body: LuaStatement[],
): LuaWhileStatement {
  return { type: 'WhileStatement', condition, body };
}

export function forStmt(
  variable: string,
  start: LuaExpression,
  end: LuaExpression,
  body: LuaStatement[],
  step?: LuaExpression,
): LuaForStatement {
  return { type: 'ForStatement', variable, start, end, body, step };
}

export function returnStmt(argument?: LuaExpression): LuaReturnStatement {
  return { type: 'ReturnStatement', argument };
}

export function mathCall(fn: string, args: LuaExpression[]): LuaCallExpression {
  return {
    type: 'CallExpression',
    callee: { type: 'MemberExpression', object: id('math'), property: fn },
    arguments: args,
  };
}
