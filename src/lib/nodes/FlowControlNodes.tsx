import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeDefinition } from "../types";
import { whileStmt, forStmt, returnStmt, literal } from "../ast/builders";

function WhileNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="While Loop"
      color="#065f46"
      selected={selected}
      inputs={[
        { id: "exec_in", label: "exec", type: "exec" },
        { id: "condition", label: "condition", type: "boolean" },
      ]}
      outputs={[
        { id: "loop_body", label: "тело цикла", type: "exec" },
        { id: "exec_out", label: "после", type: "exec" },
      ]}
    />
  );
}

export const whileNodeDef: NodeDefinition = {
  type: "flow_while",
  label: "While Loop",
  category: "Управление",
  color: "#065f46",
  inputs: [
    { id: "exec_in", label: "exec", type: "exec" },
    { id: "condition", label: "condition", type: "boolean" },
  ],
  outputs: [
    { id: "loop_body", label: "тело цикла", type: "exec" },
    { id: "exec_out", label: "после", type: "exec" },
  ],
  component: WhileNode,
  codegen: {
    execute: (_node, ctx, traverse) => [
      whileStmt(
        ctx.getInputDefault("condition", literal(false)),
        traverse("loop_body"),
      ),
      ...traverse("exec_out"),
    ],
  },
};

interface ForData {
  variable: string;
  [key: string]: unknown;
}

function ForNode({ id: nodeId, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const fd = data as ForData;
  return (
    <BaseNode
      title="For Loop"
      color="#065f46"
      selected={selected}
      inputs={[
        { id: "exec_in", label: "exec", type: "exec" },
        { id: "from", label: "from", type: "number" },
        { id: "to", label: "to", type: "number" },
        { id: "step", label: "step", type: "number" },
      ]}
      outputs={[
        { id: "loop_body", label: "тело цикла", type: "exec" },
        { id: "exec_out", label: "после", type: "exec" },
      ]}
    >
      <input
        value={fd.variable || "i"}
        onChange={(e) => updateNodeData(nodeId, { variable: e.target.value })}
        className="nodrag w-full bg-zinc-50 text-zinc-900 text-xs px-2 py-1 rounded border border-zinc-300"
        placeholder="переменная (i)"
      />
    </BaseNode>
  );
}

export const forNodeDef: NodeDefinition<ForData> = {
  type: "flow_for",
  label: "For Loop",
  category: "Управление",
  color: "#065f46",
  inputs: [
    { id: "exec_in", label: "exec", type: "exec" },
    { id: "from", label: "from", type: "number" },
    { id: "to", label: "to", type: "number" },
    { id: "step", label: "step", type: "number" },
  ],
  outputs: [
    { id: "loop_body", label: "тело цикла", type: "exec" },
    { id: "exec_out", label: "после", type: "exec" },
  ],
  defaultData: { variable: "i" },
  component: ForNode,
  codegen: {
    execute: (node, ctx, traverse) => [
      forStmt(
        node.data.variable || "i",
        ctx.getInputDefault("from", literal(1)),
        ctx.getInputDefault("to", literal(10)),
        traverse("loop_body"),
        ctx.getInputDefault("step", literal(1)),
      ),
      ...traverse("exec_out"),
    ],
  },
};

function ReturnNode({ selected }: NodeProps) {
  return (
    <BaseNode
      title="Return"
      color="#991b1b"
      selected={selected}
      inputs={[
        { id: "exec_in", label: "exec", type: "exec" },
        { id: "value", label: "value", type: "any" },
      ]}
    />
  );
}

export const returnNodeDef: NodeDefinition = {
  type: "flow_return",
  label: "Return",
  category: "Управление",
  color: "#991b1b",
  inputs: [
    { id: "exec_in", label: "exec", type: "exec" },
    { id: "value", label: "value", type: "any" },
  ],
  component: ReturnNode,
  codegen: {
    execute: (_node, ctx) => [returnStmt(ctx.getInput("value"))],
  },
};
