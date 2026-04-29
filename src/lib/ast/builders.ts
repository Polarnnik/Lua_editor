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

export function id(name: string): LuaIdentifier {
  return { type: 'Identifier', name };
}

export function literal(value: string | number | boolean | null): LuaLiteral {
  let raw: string;
  if (value === null) {
    raw = 'nil';
  } else if (typeof value === 'string') {
    raw = `"${value}"`;
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
  right: LuaExpression
): LuaBinaryExpression {
  return { type: 'BinaryExpression', operator, left, right };
}

export function unaryOp(
  operator: string,
  argument: LuaExpression
): LuaUnaryExpression {
  return { type: 'UnaryExpression', operator, argument };
}

export function call(
  callee: string,
  args: LuaExpression[] = []
): LuaCallExpression {
  return { type: 'CallExpression', callee: id(callee), arguments: args };
}

export function assign(
  names: string[],
  values: LuaExpression[]
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
  values: LuaExpression[] = []
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
  alternate: LuaStatement[] = []
): LuaIfStatement {
  return { type: 'IfStatement', condition, consequent, alternate };
}

export function funcDecl(
  name: string,
  params: string[],
  body: LuaStatement[]
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
  body: LuaStatement[]
): LuaWhileStatement {
  return { type: 'WhileStatement', condition, body };
}

export function forStmt(
  variable: string,
  start: LuaExpression,
  end: LuaExpression,
  body: LuaStatement[],
  step?: LuaExpression
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
