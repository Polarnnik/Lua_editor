import { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeDefinition } from "../types";
import { funcDecl } from "../ast/builders";

export function EventNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      title={(data.label as string) || "Событие"}
      color="#dc2626"
      selected={selected}
      outputs={[{ id: "exec_out", label: "Выполнение", type: "exec" }]}
    />
  );
}

export const eventStartDef: NodeDefinition<{ label?: string }> = {
  type: "event_start",
  label: "Старт события",
  category: "События",
  color: "#dc2626",
  isEntry: true,
  outputs: [{ id: "exec_out", label: "Выполнение", type: "exec" }],
  component: EventNode,
  codegen: {
    execute: (_node, _ctx, traverse) => [
      funcDecl("onStart", [], traverse("exec_out")),
    ],
  },
};
