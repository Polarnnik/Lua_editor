import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';

export function EventNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      title={data.label as string || 'Событие'}
      color="#dc2626"
      selected={selected}
      outputs={[{ id: 'exec_out', label: 'Выполнение', type: 'exec' }]}
    />
  );
}

nodeRegistry.register({
  type: 'event_start',
  label: 'Старт события',
  color: '#dc2626',
  outputs: [{ id: 'exec_out', label: 'Выполнение', type: 'exec' }],
  component: EventNode,
});
