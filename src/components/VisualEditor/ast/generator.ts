import type { LuaProgram, LuaStatement, LuaExpression } from './types';

const stmtGenerators: Record<string, (node: any, indent: number) => string> = {
  ExpressionStatement: (node, indent) =>
    pad(indent) + expr(node.expression) + '\n',

  AssignmentExpression: (node, indent) =>
    pad(indent) + node.left.map(l => l.name).join(', ') + ' = ' + node.right.map(expr).join(', ') + '\n',

  LocalDeclaration: (node, indent) =>
    pad(indent) + 'local ' + node.names.join(', ') +
    (node.values.length ? ' = ' + node.values.map(expr).join(', ') : '') + '\n',

  IfStatement: (node, indent) =>
    pad(indent) + 'if ' + expr(node.condition) + ' then\n' +
    node.consequent.map(s => stmt(s, indent + 1)).join('') +
    (node.alternate.length ? pad(indent) + 'else\n' + node.alternate.map(s => stmt(s, indent + 1)).join('') : '') +
    pad(indent) + 'end\n',

  FunctionDeclaration: (node, indent) =>
    pad(indent) + 'function ' + node.name + '(' + node.params.join(', ') + ')\n' +
    node.body.map(s => stmt(s, indent + 1)).join('') +
    pad(indent) + 'end\n',

  WhileStatement: (node, indent) =>
    pad(indent) + 'while ' + expr(node.condition) + ' do\n' +
    node.body.map(s => stmt(s, indent + 1)).join('') +
    pad(indent) + 'end\n',

  ForStatement: (node, indent) =>
    pad(indent) + 'for ' + node.variable + ' = ' + expr(node.start) + ', ' + expr(node.end) +
    (node.step ? ', ' + expr(node.step) : '') + ' do\n' +
    node.body.map(s => stmt(s, indent + 1)).join('') +
    pad(indent) + 'end\n',

  ReturnStatement: (node, indent) =>
    pad(indent) + 'return' + (node.argument ? ' ' + expr(node.argument) : '') + '\n',

  BreakStatement: (_node, indent) =>
    pad(indent) + 'break\n',
};

const exprGenerators: Record<string, (node: any) => string> = {
  Identifier:       (node) => node.name,
  Literal:          (node) => node.raw,
  BinaryExpression: (node) => '(' + expr(node.left) + ' ' + node.operator + ' ' + expr(node.right) + ')',
  UnaryExpression:  (node) => node.operator + expr(node.argument),
  CallExpression:   (node) => expr(node.callee) + '(' + node.arguments.map(expr).join(', ') + ')',
  IndexExpression:  (node) => expr(node.object) + '[' + expr(node.index) + ']',
  TableExpression:  (node) => '{' + node.fields.map(f => f.key ? '[' + expr(f.key) + '] = ' + expr(f.value) : expr(f.value)).join(', ') + '}',
};

const pad = (indent: number) => '  '.repeat(indent);

function stmt(node: LuaStatement, indent = 0): string {
  return stmtGenerators[node.type]?.(node, indent)
    ?? pad(indent) + `-- unsupported statement: ${node.type}\n`;
}

function expr(node: LuaExpression): string {
  return exprGenerators[node.type]?.(node)
    ?? `-- unsupported expression: ${node.type}`;
}

export function generateLua(ast: LuaProgram): string {
  return ast.body.map(stmt).join('\n') + '\n';
}