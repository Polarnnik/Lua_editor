import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';

export function LogicNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      title={data.label as string || 'Условие (If)'}
      color="#9ca3af"
      selected={selected}
      inputs={[
        { id: 'exec_in', label: 'Выполнение', type: 'exec' },
        { id: 'condition', label: 'Условие', type: 'boolean' },
      ]}
      outputs={[
        { id: 'exec_true', label: 'Истина', type: 'exec' },
        { id: 'exec_false', label: 'Ложь', type: 'exec' },
      ]}
    />
  );
}

nodeRegistry.register({
  type: 'logic_if',
  label: 'Условие (If)',
  color: '#9ca3af',
  inputs: [
    { id: 'exec_in', label: 'Выполнение', type: 'exec' },
    { id: 'condition', label: 'Условие', type: 'boolean' },
  ],
  outputs: [
    { id: 'exec_true', label: 'Истина', type: 'exec' },
    { id: 'exec_false', label: 'Ложь', type: 'exec' },
  ],
  component: LogicNode,
});
