import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';

export function ActionNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      title={data.label as string || 'Действие'}
      color="#2563eb"
      selected={selected}
      inputs={[
        { id: 'exec_in', label: 'Выполнение', type: 'exec' },
        { id: 'value', label: 'Значение', type: 'any' },
      ]}
      outputs={[{ id: 'exec_out', label: 'Выполнение', type: 'exec' }]}
    />
  );
}

nodeRegistry.register({
  type: 'action_print',
  label: 'Печать (Print)',
  color: '#2563eb',
  inputs: [
    { id: 'exec_in', label: 'Выполнение', type: 'exec' },
    { id: 'value', label: 'Значение', type: 'any' },
  ],
  outputs: [{ id: 'exec_out', label: 'Выполнение', type: 'exec' }],
  component: ActionNode,
});
