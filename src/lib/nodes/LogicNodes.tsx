import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { literal, unaryOp, binaryOp } from '../ast/builders';

interface BoolData {
  value: boolean;
  [key: string]: unknown;
}

function BoolNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const bd = data as BoolData;
  return (
    <BaseNode
      title="Boolean"
      color="#dc2626"
      selected={selected}
      outputs={[{ id: 'value', label: 'value', type: 'boolean' }]}
    >
      <select
        value={String(bd.value ?? true)}
        onChange={(e) =>
          updateNodeData(nodeId, { value: e.target.value === 'true' })
        }
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </BaseNode>
  );
}

export const boolNodeDef: NodeDefinition<BoolData> = {
  type: 'value_boolean',
  label: 'Boolean',
  category: 'Значения',
  color: '#dc2626',
  outputs: [{ id: 'value', label: 'value', type: 'boolean' }],
  defaultData: { value: true },
  component: BoolNode,
  codegen: {
    evaluate: (node) => literal(node.data.value ?? true),
  },
};

function NotNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="NOT"
      color="#dc2626"
      selected={selected}
      inputs={[{ id: 'value', label: 'value', type: 'boolean' }]}
      outputs={[{ id: 'result', label: 'result', type: 'boolean' }]}
    />
  );
}

export const notNodeDef: NodeDefinition = {
  type: 'logic_not',
  label: 'NOT',
  category: 'Логика',
  color: '#dc2626',
  inputs: [{ id: 'value', label: 'value', type: 'boolean' }],
  outputs: [{ id: 'result', label: 'result', type: 'boolean' }],
  component: NotNode,
  codegen: {
    evaluate: (_node, ctx) =>
      unaryOp('not ', ctx.getInputDefault('value', literal(false))),
  },
};

interface BoolOpData {
  op: 'and' | 'or';
  [key: string]: unknown;
}

function BoolOpNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const bd = data as BoolOpData;
  return (
    <BaseNode
      title={bd.op === 'and' ? 'AND' : 'OR'}
      color="#dc2626"
      selected={selected}
      inputs={[
        { id: 'a', label: 'a', type: 'boolean' },
        { id: 'b', label: 'b', type: 'boolean' },
      ]}
      outputs={[{ id: 'result', label: 'result', type: 'boolean' }]}
    >
      <select
        value={bd.op || 'and'}
        onChange={(e) => updateNodeData(nodeId, { op: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
      >
        <option value="and">AND</option>
        <option value="or">OR</option>
      </select>
    </BaseNode>
  );
}

export const boolOpNodeDef: NodeDefinition<BoolOpData> = {
  type: 'logic_boolop',
  label: 'AND / OR',
  category: 'Логика',
  color: '#dc2626',
  inputs: [
    { id: 'a', label: 'a', type: 'boolean' },
    { id: 'b', label: 'b', type: 'boolean' },
  ],
  outputs: [{ id: 'result', label: 'result', type: 'boolean' }],
  defaultData: { op: 'and' },
  component: BoolOpNode,
  codegen: {
    evaluate: (node, ctx) =>
      binaryOp(
        node.data.op || 'and',
        ctx.getInputDefault('a', literal(false)),
        ctx.getInputDefault('b', literal(false))
      ),
  },
};
