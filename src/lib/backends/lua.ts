import { CodeBackend } from '../types';
import type { LuaProgram, LuaStatement, LuaExpression } from '../ast/types';

// ─── Lua printer ──────────────────────────────────────────────────────────────
// Единственное место где знают про синтаксис Lua.
// Получает AST Program → возвращает строку кода.

const pad = (indent: number) => '  '.repeat(indent);

function stmt(node: LuaStatement, indent = 0): string {
  switch (node.type) {
    case 'ExpressionStatement':
      return pad(indent) + expr(node.expression) + '\n';
    case 'AssignmentExpression':
      return pad(indent) + node.left.map((l) => l.name).join(', ') + ' = ' + node.right.map(expr).join(', ') + '\n';
    case 'LocalDeclaration':
      return pad(indent) + 'local ' + node.names.join(', ') +
        (node.values.length ? ' = ' + node.values.map(expr).join(', ') : '') + '\n';
    case 'IfStatement':
      return pad(indent) + 'if ' + expr(node.condition) + ' then\n' +
        node.consequent.map((s) => stmt(s, indent + 1)).join('') +
        (node.alternate.length ? pad(indent) + 'else\n' + node.alternate.map((s) => stmt(s, indent + 1)).join('') : '') +
        pad(indent) + 'end\n';
    case 'FunctionDeclaration':
      return pad(indent) + 'function ' + node.name + '(' + node.params.join(', ') + ')\n' +
        node.body.map((s) => stmt(s, indent + 1)).join('') +
        pad(indent) + 'end\n';
    case 'WhileStatement':
      return pad(indent) + 'while ' + expr(node.condition) + ' do\n' +
        node.body.map((s) => stmt(s, indent + 1)).join('') +
        pad(indent) + 'end\n';
    case 'ForStatement':
      return pad(indent) + 'for ' + node.variable + ' = ' + expr(node.start) + ', ' + expr(node.end) +
        (node.step ? ', ' + expr(node.step) : '') + ' do\n' +
        node.body.map((s) => stmt(s, indent + 1)).join('') +
        pad(indent) + 'end\n';
    case 'ReturnStatement':
      return pad(indent) + 'return' + (node.argument ? ' ' + expr(node.argument) : '') + '\n';
    case 'BreakStatement':
      return pad(indent) + 'break\n';
    default:
      return pad(indent) + `-- unsupported: ${(node as any).type}\n`;
  }
}

function expr(node: LuaExpression): string {
  switch (node.type) {
    case 'Identifier':       return node.name;
    case 'Literal':          return node.raw;
    case 'BinaryExpression': return '(' + expr(node.left) + ' ' + node.operator + ' ' + expr(node.right) + ')';
    case 'UnaryExpression':  return node.operator + expr(node.argument);
    case 'CallExpression':   return expr(node.callee) + '(' + node.arguments.map(expr).join(', ') + ')';
    case 'IndexExpression':  return expr(node.object) + '[' + expr(node.index) + ']';
    case 'TableExpression':  return '{' + node.fields.map((f) => f.key ? '[' + expr(f.key) + '] = ' + expr(f.value) : expr(f.value)).join(', ') + '}';
    default:                 return `--[[unsupported: ${(node as any).type}]]`;
  }
}

// ─── Публичный экспорт ────────────────────────────────────────────────────────

export const luaBackend: CodeBackend = {
  language: 'lua',
  emit(ast) {
    const program = ast as LuaProgram;
    return program.body.map((s) => stmt(s as LuaStatement)).join('\n') + '\n';
  },
};
