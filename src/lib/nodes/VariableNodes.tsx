import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { localDecl, assign, id, literal } from '../ast/builders';

const inputCls =
  'nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300';

interface VarData {
  name: string;
  [key: string]: unknown;
}

function VarDeclNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const vd = data as VarData;
  return (
    <BaseNode
      title="Переменная"
      color="#b45309"
      selected={selected}
      inputs={[
        { id: 'exec_in', label: 'exec', type: 'exec' },
        { id: 'value', label: 'value', type: 'any' },
      ]}
      outputs={[
        { id: 'exec_out', label: 'exec', type: 'exec' },
        { id: 'var_out', label: 'var', type: 'any' },
      ]}
    >
      <input
        value={vd.name || 'myVar'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className={inputCls}
        placeholder="имя переменной"
      />
    </BaseNode>
  );
}

export const varDeclDef: NodeDefinition<VarData> = {
  type: 'var_decl',
  label: 'Переменная',
  category: 'Переменные',
  color: '#b45309',
  inputs: [
    { id: 'exec_in', label: 'exec', type: 'exec' },
    { id: 'value', label: 'value', type: 'any' },
  ],
  outputs: [
    { id: 'exec_out', label: 'exec', type: 'exec' },
    { id: 'var_out', label: 'var', type: 'any' },
  ],
  defaultData: { name: 'myVar' },
  component: VarDeclNode,
  codegen: {
    execute: (node, ctx, traverse) => [
      localDecl(
        [node.data.name || 'myVar'],
        [ctx.getInputDefault('value', literal(null))]
      ),
      ...traverse('exec_out'),
    ],
  },
};

function VarGetNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const vd = data as VarData;
  return (
    <BaseNode
      title="Получить переменную"
      color="#b45309"
      selected={selected}
      outputs={[{ id: 'value', label: 'value', type: 'any' }]}
    >
      <input
        value={vd.name || 'myVar'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className={inputCls}
        placeholder="имя переменной"
      />
    </BaseNode>
  );
}

export const varGetDef: NodeDefinition<VarData> = {
  type: 'var_get',
  label: 'Получить переменную',
  category: 'Переменные',
  color: '#b45309',
  outputs: [{ id: 'value', label: 'value', type: 'any' }],
  defaultData: { name: 'myVar' },
  component: VarGetNode,
  codegen: {
    evaluate: (node) => id(node.data.name || 'myVar'),
  },
};

function VarSetNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const vd = data as VarData;
  return (
    <BaseNode
      title="Присвоить переменную"
      color="#b45309"
      selected={selected}
      inputs={[
        { id: 'exec_in', label: 'exec', type: 'exec' },
        { id: 'value', label: 'value', type: 'any' },
      ]}
      outputs={[{ id: 'exec_out', label: 'exec', type: 'exec' }]}
    >
      <input
        value={vd.name || 'myVar'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className={inputCls}
        placeholder="имя переменной"
      />
    </BaseNode>
  );
}

export const varSetDef: NodeDefinition<VarData> = {
  type: 'var_set',
  label: 'Присвоить переменную',
  category: 'Переменные',
  color: '#b45309',
  inputs: [
    { id: 'exec_in', label: 'exec', type: 'exec' },
    { id: 'value', label: 'value', type: 'any' },
  ],
  outputs: [{ id: 'exec_out', label: 'exec', type: 'exec' }],
  defaultData: { name: 'myVar' },
  component: VarSetNode,
  codegen: {
    execute: (node, ctx, traverse) => [
      assign(
        [node.data.name || 'myVar'],
        [ctx.getInputDefault('value', literal(null))]
      ),
      ...traverse('exec_out'),
    ],
  },
};
