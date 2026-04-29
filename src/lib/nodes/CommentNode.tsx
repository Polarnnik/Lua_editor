import React from "react";
import { NodeProps, useReactFlow, NodeResizer } from "@xyflow/react";
import { NodeDefinition } from "../types";
import { literal } from "../ast/builders";

interface CommentData {
  text: string;
  [key: string]: unknown;
}

export function CommentNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const cd = data as CommentData;

  return (
    <div
      style={{
        background: "rgba(250,204,21,0.15)",
        border: `2px solid ${selected ? "var(--ve-node-border-sel)" : "#fbbf24"}`,
        borderRadius: "var(--ve-node-radius)",
        minWidth: 160,
        minHeight: 80,
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <NodeResizer
        minWidth={160}
        minHeight={80}
        isVisible={selected}
        lineStyle={{ border: "1px solid #fbbf24" }}
        handleStyle={{ background: "#fbbf24", border: "none", width: 8, height: 8 }}
      />
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#92400e",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Комментарий
      </div>
      <textarea
        value={cd.text || ""}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Текст комментария..."
        className="nodrag nowheel"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
          fontSize: 12,
          color: "var(--ve-node-text)",
          fontFamily: "inherit",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

export const commentNodeDef: NodeDefinition<CommentData> = {
  type: "comment",
  label: "Комментарий",
  category: "Утилиты",
  color: "#fbbf24",
  defaultData: { text: "" },
  component: CommentNode,
  codegen: {
    evaluate: () => literal(null),
  },
};
