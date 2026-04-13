import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';

export function MathNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();

  const handleOpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { operator: e.target.value });
  };

  return (
    <BaseNode
      title={data.label as string || 'Математика'}
      color="#16a34a"
      selected={selected}
      inputs={[
        { id: 'a', label: 'A', type: 'number' },
        { id: 'b', label: 'B', type: 'number' },
      ]}
      outputs={[{ id: 'result', label: 'Результат', type: 'number' }]}
    >
      <select
        value={(data.operator as string) || '+'}
        onChange={handleOpChange}
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

nodeRegistry.register({
  type: 'logic_math',
  label: 'Математика',
  color: '#16a34a',
  inputs: [
    { id: 'a', label: 'A', type: 'number' },
    { id: 'b', label: 'B', type: 'number' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'number' }],
  component: MathNode,
});
