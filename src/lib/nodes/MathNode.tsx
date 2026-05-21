import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { binaryOp, literal } from '../ast/builders';

interface MathData {
  operator: string;
  label?: string;
  [key: string]: unknown;
}

export function MathNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const md = data as MathData;

  return (
    <BaseNode
      title={md.label || 'Математика'}
      color="#16a34a"
      selected={selected}
      inputs={[
        { id: 'a', label: 'A', type: 'number' },
        { id: 'b', label: 'B', type: 'number' },
      ]}
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    >
      <select
        value={md.operator || '+'}
        onChange={(e) => updateNodeData(id, { operator: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-blue-500"
      >
        <option value="+">Сложение (+)</option>
        <option value="-">Вычитание (-)</option>
        <option value="*">Умножение (*)</option>
        <option value="/">Деление (/)</option>
      </select>
    </BaseNode>
  );
}

export const mathNodeDef: NodeDefinition<MathData> = {
  type: 'logic_math',
  label: 'Математика',
  category: 'Математика',
  color: '#16a34a',
  inputs: [
    { id: 'a', label: 'A', type: 'number' },
    { id: 'b', label: 'B', type: 'number' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  defaultData: { operator: '+' },
  component: MathNode,
  codegen: {
    evaluate: (node, ctx) =>
      binaryOp(
        node.data.operator || '+',
        ctx.getInputDefault('a', literal(0)),
        ctx.getInputDefault('b', literal(0)),
      ),
  },
};
