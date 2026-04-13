import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';

export function CompareNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();

  const handleOpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { operator: e.target.value });
  };

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
        onChange={handleOpChange}
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

nodeRegistry.register({
  type: 'logic_compare',
  label: 'Сравнение',
  color: '#ef4444',
  inputs: [
    { id: 'a', label: 'A', type: 'any' },
    { id: 'b', label: 'B', type: 'any' },
  ],
  outputs: [{ id: 'result', label: 'Результат', type: 'boolean' }],
  component: CompareNode,
});
