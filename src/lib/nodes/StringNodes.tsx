import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { literal, unaryOp, binaryOp, call } from '../ast/builders';

function ConcatNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="Конкатенация (..)"
      color="#db2777"
      selected={selected}
      inputs={[
        { id: 'a', label: 'a', type: 'string' },
        { id: 'b', label: 'b', type: 'string' },
      ]}
      outputs={[{ id: 'result', label: 'Результат', type: 'string' }]}
    />
  );
}

export const concatNodeDef: NodeDefinition = {
  type: 'string_concat',
  label: 'Конкатенация (..)',
  category: 'Строки',
  color: '#db2777',
  inputs: [
    { id: 'a', label: 'a', type: 'string' },
    { id: 'b', label: 'b', type: 'string' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'string' }],
  component: ConcatNode,
  codegen: {
    evaluate: (_node, ctx) =>
      binaryOp(
        '..',
        ctx.getInputDefault('a', literal('')),
        ctx.getInputDefault('b', literal('')),
      ),
  },
};

function StrLenNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="Длина (#)"
      color="#db2777"
      selected={selected}
      inputs={[{ id: 'str', label: 'Строка', type: 'string' }]}
      outputs={[{ id: 'result', label: 'Длина', type: 'number' }]}
    />
  );
}

export const strLenNodeDef: NodeDefinition = {
  type: 'string_len',
  label: 'Длина (#)',
  category: 'Строки',
  color: '#db2777',
  inputs: [{ id: 'str', label: 'Строка', type: 'string' }],
  outputs: [{ id: 'result', label: 'Длина', type: 'number' }],
  component: StrLenNode,
  codegen: {
    evaluate: (_node, ctx) =>
      unaryOp('#', ctx.getInputDefault('str', literal(''))),
  },
};

interface ConvertData {
  fn: 'tostring' | 'tonumber';
  [key: string]: unknown;
}

function ConvertNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const cd = data as ConvertData;
  const fn = cd.fn || 'tostring';
  return (
    <BaseNode
      title={fn + '()'}
      color="#6366f1"
      selected={selected}
      inputs={[{ id: 'value', label: 'value', type: 'any' }]}
      outputs={[
        {
          id: 'result',
          label: 'Результат',
          type: fn === 'tostring' ? 'string' : 'number',
        },
      ]}
    >
      <select
        value={fn}
        onChange={(e) => updateNodeData(nodeId, { fn: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        <option value="tostring">tostring()</option>
        <option value="tonumber">tonumber()</option>
      </select>
    </BaseNode>
  );
}

export const convertNodeDef: NodeDefinition<ConvertData> = {
  type: 'util_convert',
  label: 'Конвертация типов',
  category: 'Утилиты',
  color: '#6366f1',
  inputs: [{ id: 'value', label: 'value', type: 'any' }],
  outputs: [{ id: 'result', label: 'result', type: 'any' }],
  defaultData: { fn: 'tostring' },
  component: ConvertNode,
  codegen: {
    evaluate: (node, ctx) => {
      const fn = (node.data as ConvertData).fn ?? 'tostring';
      return call(fn, [ctx.getInputDefault('value', literal(null))]);
    },
  },
};
