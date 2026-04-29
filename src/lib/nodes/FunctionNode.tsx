import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NodeDefinition } from '../types';
import { funcDecl, call, exprStmt, id, literal } from '../ast/builders';

interface FunctionDeclData {
  name: string;
  params: string;
  [key: string]: unknown;
}

function FunctionDeclNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const fd = data as FunctionDeclData;
  const params = fd.params || '';

  return (
    <BaseNode
      title="Функция"
      color="#7c3aed"
      selected={selected}
      outputs={[{ id: 'exec_out', label: 'тело', type: 'exec' }]}
    >
      <input
        value={fd.name || 'myFunction'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-violet-500"
        placeholder="имя функции"
      />
      <input
        value={params}
        onChange={(e) => updateNodeData(nodeId, { params: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-violet-500"
        placeholder="параметры: a, b, c"
      />
      <span className="text-xs text-zinc-400 px-1">
        function {fd.name || 'myFunction'}({params})
      </span>
    </BaseNode>
  );
}

export const functionDeclDef: NodeDefinition<FunctionDeclData> = {
  type: 'function_decl',
  label: 'Объявить функцию',
  category: 'Функции',
  color: '#7c3aed',
  isEntry: true,
  outputs: [{ id: 'exec_out', label: 'тело', type: 'exec' }],
  defaultData: { name: 'myFunction', params: '' },
  component: FunctionDeclNode,
  codegen: {
    execute: (node, _ctx, traverse) => {
      const name = node.data.name || 'myFunction';
      const params = (node.data.params || '')
        .split(',')
        .map((p: string) => p.trim())
        .filter(Boolean);
      return [funcDecl(name, params, traverse('exec_out'))];
    },
  },
};

interface CallFunctionData {
  name: string;
  argCount: number;
  [key: string]: unknown;
}

function CallFunctionNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const cd = data as CallFunctionData;
  const argCount = Math.max(0, Math.min(4, Number(cd.argCount ?? 1)));

  const argPins = Array.from({ length: argCount }, (_, i) => ({
    id: `arg_${i}`,
    label: `arg ${i}`,
    type: 'any' as const,
  }));

  return (
    <BaseNode
      title="Вызвать функцию"
      color="#7c3aed"
      selected={selected}
      inputs={[{ id: 'exec_in', label: 'exec', type: 'exec' }, ...argPins]}
      outputs={[{ id: 'exec_out', label: 'exec', type: 'exec' }]}
    >
      <input
        value={cd.name || 'myFunction'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-violet-500"
        placeholder="имя функции"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">аргументов:</span>
        <input
          type="number"
          min={0}
          max={4}
          value={argCount}
          onChange={(e) =>
            updateNodeData(nodeId, { argCount: Number(e.target.value) })
          }
          className="nodrag w-14 bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none"
        />
      </div>
    </BaseNode>
  );
}

export const callFunctionDef: NodeDefinition<CallFunctionData> = {
  type: 'function_call',
  label: 'Вызвать функцию',
  category: 'Функции',
  color: '#7c3aed',
  inputs: [
    { id: 'exec_in', label: 'exec', type: 'exec' },
    { id: 'arg_0', label: 'arg 0', type: 'any' },
  ],
  outputs: [{ id: 'exec_out', label: 'exec', type: 'exec' }],
  defaultData: { name: 'myFunction', argCount: 1 },
  component: CallFunctionNode,
  codegen: {
    execute: (node, ctx, traverse) => {
      const name = node.data.name || 'myFunction';
      const argCount = Math.max(
        0,
        Math.min(4, Number(node.data.argCount ?? 1))
      );
      const args = Array.from({ length: argCount }, (_, i) =>
        ctx.getInputDefault(`arg_${i}`, literal(null))
      );
      return [exprStmt(call(name, args)), ...traverse('exec_out')];
    },
  },
};

interface GetParamData {
  name: string;
  [key: string]: unknown;
}

function GetParamNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const gd = data as GetParamData;
  return (
    <BaseNode
      title="Параметр функции"
      color="#7c3aed"
      selected={selected}
      outputs={[{ id: 'value', label: 'value', type: 'any' }]}
    >
      <input
        value={gd.name || 'a'}
        onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300 focus:outline-none focus:border-violet-500"
        placeholder="имя параметра"
      />
    </BaseNode>
  );
}

export const getParamDef: NodeDefinition<GetParamData> = {
  type: 'function_param',
  label: 'Параметр функции',
  category: 'Функции',
  color: '#7c3aed',
  outputs: [{ id: 'value', label: 'value', type: 'any' }],
  defaultData: { name: 'a' },
  component: GetParamNode,
  codegen: {
    evaluate: (node) => id(node.data.name || 'a'),
  },
};
