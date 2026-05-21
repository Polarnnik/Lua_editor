import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { mathCall, literal, binaryOp, unaryOp } from '../ast/builders';

interface TrigData {
  fn: string;
  label: string;
  [key: string]: unknown;
}

function TrigNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const td = data as TrigData;
  return (
    <BaseNode
      title={td.label}
      color="#0891b2"
      selected={selected}
      inputs={[{ id: 'x', label: 'x', type: 'number' }]}
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    >
      <select
        value={td.fn || 'sin'}
        onChange={(e) =>
          updateNodeData(id, {
            fn: e.target.value,
            label: e.target.value + '(x)',
          })
        }
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        {[
          'sin',
          'cos',
          'tan',
          'asin',
          'acos',
          'atan',
          'sinh',
          'cosh',
          'tanh',
        ].map((f) => (
          <option key={f} value={f}>
            {f}(x)
          </option>
        ))}
      </select>
    </BaseNode>
  );
}

export const trigNodeDef: NodeDefinition<TrigData> = {
  type: 'math_trig',
  label: 'Тригонометрия',
  category: 'Математика',
  color: '#0891b2',
  inputs: [{ id: 'x', label: 'X', type: 'number' }],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  defaultData: { fn: 'sin', label: 'sin(x)' },
  component: TrigNode,
  codegen: {
    evaluate: (node, ctx) =>
      mathCall(node.data.fn, [ctx.getInputDefault('x', literal(0))]),
  },
};

interface PowerData {
  mode: string;
  label: string;
  [key: string]: unknown;
}

function PowerNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const pd = data as PowerData;
  const mode = pd.mode || 'pow';
  return (
    <BaseNode
      title={pd.label}
      color="#0891b2"
      selected={selected}
      inputs={
        mode === 'pow'
          ? [
              { id: 'base', label: 'Основание', type: 'number' },
              { id: 'exp', label: 'Степень', type: 'number' },
            ]
          : [{ id: 'x', label: 'X', type: 'number' }]
      }
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    >
      <select
        value={mode}
        onChange={(e) =>
          updateNodeData(id, {
            mode: e.target.value,
            label:
              e.target.value === 'pow' ? 'base ^ exp' : e.target.value + '(x)',
          })
        }
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        <option value="pow">base ^ exp</option>
        <option value="sqrt">sqrt(x)</option>
        <option value="log">log(x)</option>
        <option value="exp">exp(x)</option>
        <option value="abs">abs(x)</option>
        <option value="floor">floor(x)</option>
        <option value="ceil">ceil(x)</option>
      </select>
    </BaseNode>
  );
}

export const powerNodeDef: NodeDefinition<PowerData> = {
  type: 'math_power',
  label: 'Степень/Корень',
  category: 'Математика',
  color: '#0891b2',
  inputs: [
    { id: 'base', label: 'Основание', type: 'number' },
    { id: 'exp', label: 'Степень', type: 'number' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  defaultData: { mode: 'pow', label: 'base ^ exp' },
  component: PowerNode,
  codegen: {
    evaluate: (node, ctx) => {
      const mode = node.data.mode || 'pow';
      if (mode === 'pow') {
        return binaryOp(
          '^',
          ctx.getInputDefault('base', literal(0)),
          ctx.getInputDefault('exp', literal(2)),
        );
      }
      return mathCall(mode, [ctx.getInputDefault('x', literal(0))]);
    },
  },
};

interface BitData {
  op: string;
  label: string;
  [key: string]: unknown;
}

const LUA_BIT_OPS: Record<string, string> = {
  band: '&',
  bor: '|',
  bxor: '~',
  lshift: '<<',
  rshift: '>>',
};

const BINARY_BIT_OPS = new Set(Object.keys(LUA_BIT_OPS));

function BitNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const bd = data as BitData;
  const op = bd.op || 'band';
  const isBinary = BINARY_BIT_OPS.has(op);
  return (
    <BaseNode
      title={bd.label}
      color="#7c3aed"
      selected={selected}
      inputs={
        isBinary
          ? [
              { id: 'a', label: 'a', type: 'number' },
              { id: 'b', label: 'b', type: 'number' },
            ]
          : [{ id: 'a', label: 'a', type: 'number' }]
      }
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    >
      <select
        value={op}
        onChange={(e) =>
          updateNodeData(id, { op: e.target.value, label: e.target.value })
        }
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        <option value="band">И (&amp;)</option>
        <option value="bor">ИЛИ (|)</option>
        <option value="bxor">Исключающее ИЛИ (~)</option>
        <option value="lshift">Сдвиг влево (&lt;&lt;)</option>
        <option value="rshift">Сдвиг вправо (&gt;&gt;)</option>
        <option value="bnot">НЕ (~a)</option>
      </select>
    </BaseNode>
  );
}

export const bitNodeDef: NodeDefinition<BitData> = {
  type: 'math_bit',
  label: 'Битовые операции',
  category: 'Математика',
  color: '#7c3aed',
  inputs: [
    { id: 'a', label: 'a', type: 'number' },
    { id: 'b', label: 'b', type: 'number' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  defaultData: { op: 'band', label: 'И (&)' },
  component: BitNode,
  codegen: {
    evaluate: (node, ctx) => {
      const op = node.data.op || 'band';
      const a = ctx.getInputDefault('a', literal(0));
      const b = ctx.getInputDefault('b', literal(0));
      if (op === 'bnot') return unaryOp('~', a);
      return binaryOp(LUA_BIT_OPS[op] ?? '&', a, b);
    },
  },
};

function ClampNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="Ограничение (Clamp)"
      color="#0891b2"
      selected={selected}
      inputs={[
        { id: 'value', label: 'Значение', type: 'number' },
        { id: 'min', label: 'Мин', type: 'number' },
        { id: 'max', label: 'Макс', type: 'number' },
      ]}
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    />
  );
}

export const clampNodeDef: NodeDefinition = {
  type: 'math_clamp',
  label: 'Ограничение (Clamp)',
  category: 'Математика',
  color: '#0891b2',
  inputs: [
    { id: 'value', label: 'Значение', type: 'number' },
    { id: 'min', label: 'Мин', type: 'number' },
    { id: 'max', label: 'Макс', type: 'number' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  component: ClampNode,
  codegen: {
    evaluate: (_node, ctx) =>
      mathCall('min', [
        mathCall('max', [
          ctx.getInputDefault('value', literal(0)),
          ctx.getInputDefault('min', literal(0)),
        ]),
        ctx.getInputDefault('max', literal(1)),
      ]),
  },
};
