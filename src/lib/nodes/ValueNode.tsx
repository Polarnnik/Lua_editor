import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition, PinType } from '../types';
import { literal } from '../ast/builders';

interface ValueData {
  valueType: PinType;
  value: string | number;
  label?: string;
  [key: string]: unknown;
}

export function ValueNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const vd = data as ValueData;
  const type = vd.valueType || 'string';
  const color =
    type === 'string' ? '#db2777' : type === 'number' ? '#16a34a' : '#ea580c';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      type === 'number'
        ? e.target.value === ''
          ? 0
          : Number(e.target.value)
        : e.target.value;
    updateNodeData(id, { value });
  };

  return (
    <BaseNode
      title={vd.label || 'Значение'}
      color={color}
      selected={selected}
      outputs={[{ id: 'value', label: 'Значение', type }]}
    >
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={vd.value ?? ''}
        onChange={handleChange}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-blue-500"
        placeholder={`Введите ${type === 'number' ? 'число' : 'строку'}...`}
      />
    </BaseNode>
  );
}

export const valueStringDef: NodeDefinition<ValueData> = {
  type: 'value_string',
  label: 'Строка',
  category: 'Значения',
  color: '#db2777',
  outputs: [{ id: 'value', label: 'Значение', type: 'string' }],
  defaultData: { valueType: 'string', value: '' },
  component: ValueNode,
  codegen: {
    evaluate: (node) => literal((node.data.value as string) || ''),
  },
};

export const valueNumberDef: NodeDefinition<ValueData> = {
  type: 'value_number',
  label: 'Число',
  category: 'Значения',
  color: '#16a34a',
  outputs: [{ id: 'value', label: 'Значение', type: 'number' }],
  defaultData: { valueType: 'number', value: 0 },
  component: ValueNode,
  codegen: {
    evaluate: (node) => literal((node.data.value as number) ?? 0),
  },
};
