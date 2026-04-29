import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { call, exprStmt } from '../ast/builders';

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

export const actionPrintDef: NodeDefinition = {
  type: 'action_print',
  label: 'Печать (Print)',
  category: 'Действия',
  color: '#2563eb',
  inputs: [
    { id: 'exec_in', label: 'Выполнение', type: 'exec' },
    { id: 'value', label: 'Значение', type: 'any' },
  ],
  outputs: [{ id: 'exec_out', label: 'Выполнение', type: 'exec' }],
  component: ActionNode,
  codegen: {
    execute: (_node, ctx, traverse) => [
      exprStmt(call('print', [ctx.getInput('value')])),
      ...traverse('exec_out'),
    ],
  },
};
