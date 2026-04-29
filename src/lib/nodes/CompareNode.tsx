import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { binaryOp, literal } from '../ast/builders';

export function CompareNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode
      title={data.label as string || 'Сравнение'}
      color="#ef4444"
      selected={selected}
      inputs={[
        { id: 'a', label: 'A', type: 'any' },
        { id: 'b', label: 'B', type: 'any' },
      ]}
      outputs={[{ id: 'result', label: 'Результат', type: 'boolean' }]}
    >
      <select
        value={(data.operator as string) || '=='}
        onChange={(e) => updateNodeData(id, { operator: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-blue-500"
      >
        <option value="==">Равно (==)</option>
        <option value="~=">Не равно (~=)</option>
        <option value=">">Больше (&gt;)</option>
        <option value="<">Меньше (&lt;)</option>
        <option value=">=">Больше/Равно (&gt;=)</option>
        <option value="<=">Меньше/Равно (&lt;=)</option>
      </select>
    </BaseNode>
  );
}

export const compareNodeDef: NodeDefinition = {
  type: 'logic_compare',
  label: 'Сравнение',
  category: 'Логика',
  color: '#ef4444',
  inputs: [
    { id: 'a', label: 'A', type: 'any' },
    { id: 'b', label: 'B', type: 'any' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'boolean' }],
  defaultData: { operator: '==' },
  component: CompareNode,
  codegen: {
    evaluate: (node, ctx) => binaryOp(
      (node.data as any).operator as string || '==',
      ctx.getInputDefault('a', literal(0)),
      ctx.getInputDefault('b', literal(0)),
    ),
  },
};
