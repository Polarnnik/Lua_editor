import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { nodeRegistry } from '../nodeRegistry';
import { PinType } from '../types';

export function ValueNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const type = data.valueType as PinType || 'string';
  const color = type === 'string' ? '#db2777' : type === 'number' ? '#16a34a' : '#ea580c';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'number' 
      ? (e.target.value === '' ? 0 : Number(e.target.value))
      : e.target.value;
    updateNodeData(id, { value });
  };

  return (
    <BaseNode
      title={data.label as string || 'Значение'}
      color={color}
      selected={selected}
      outputs={[{ id: 'value', label: 'Значение', type }]}
    >
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={data.value ?? ''}
        onChange={handleChange}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-blue-500"
        placeholder={`Введите ${type === 'number' ? 'число' : 'строку'}...`}
      />
    </BaseNode>
  );
}

nodeRegistry.register({
  type: 'value_string',
  label: 'Строка',
  color: '#db2777',
  outputs: [{ id: 'value', label: 'Значение', type: 'string' }],
  component: ValueNode,
  defaultData: { valueType: 'string' },
});

nodeRegistry.register({
  type: 'value_number',
  label: 'Число',
  color: '#16a34a',
  outputs: [{ id: 'value', label: 'Значение', type: 'number' }],
  component: ValueNode,
  defaultData: { valueType: 'number' },
});
