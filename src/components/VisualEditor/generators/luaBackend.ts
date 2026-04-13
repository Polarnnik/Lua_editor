import { Node } from '@xyflow/react';
import { createGeneratorBackend } from './types';
import { call, binaryOp, literal, ifStmt, exprStmt } from '../ast';

export const luaBackend = createGeneratorBackend('lua');

// execute - для узлов с потоком управления (exec in/out), возвращает statements
// evaluate - для узлов-значений, возвращает одно выражение (expression)

luaBackend.register('event_start', {
  execute: (node, ctx, traverse) => {
    return traverse('exec_out');
  }
});

luaBackend.register('action_print', {
  execute: (node, ctx, traverse) => {
    const value = ctx.getInput('value');
    return [
      exprStmt(call('print', [value])),
      ...traverse('exec_out')
    ];
  }
});

luaBackend.register('logic_if', {
  execute: (node, ctx, traverse) => {
    const condition = ctx.getInputDefault('condition', literal(false));
    const consequent = traverse('exec_true');
    const alternate = traverse('exec_false');
    return [ifStmt(condition, consequent, alternate)];
  }
});

luaBackend.register('value_string', {
  evaluate: (node) => {
    const value = node.data.value as string || '';
    return literal(value);
  }
});

luaBackend.register('value_number', {
  evaluate: (node) => {
    const value = node.data.value as number ?? 0;
    return literal(value);
  }
});

luaBackend.register('logic_math', {
  evaluate: (node, ctx) => {
    const a = ctx.getInputDefault('a', literal(0));
    const b = ctx.getInputDefault('b', literal(0));
    const op = (node.data.operator as string) || '+';
    return binaryOp(op, a, b);
  }
});

luaBackend.register('logic_compare', {
  evaluate: (node, ctx) => {
    const a = ctx.getInputDefault('a', literal(0));
    const b = ctx.getInputDefault('b', literal(0));
    const op = (node.data.operator as string) || '==';
    return binaryOp(op, a, b);
  }
});
