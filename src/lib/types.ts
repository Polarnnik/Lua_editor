import React from "react";
import { NodeProps } from "@xyflow/react";
import { Expr, Stmt } from "./ast/types";

export type PinType = "exec" | "string" | "number" | "boolean" | "any";

// ─── Editor theme ─────────────────────────────────────────────────────────────
// Pass Partial<EditorTheme> — only the fields you want to override.
// All values are also available as CSS variables (--ve-*) on the root element,
// so you can override from your own stylesheet without touching props:
//   .my-editor { --ve-node-bg: #1c1c1e; --ve-pin-exec: #ffffff; }

export interface EditorTheme {
  pinColors: Record<PinType, string>;
  nodeBackground: string;
  nodeTextColor: string;
  nodeBorder: string;
  nodeSelectedBorder: string;
  nodeBorderRadius: string;
  nodeBoxShadow: string;
  canvasBackground: string;
  canvasGrid: string;
  menuBackground: string;
  menuBorder: string;
  menuText: string;
  menuTextMuted: string;
  menuItemHover: string;
  menuAccent: string;
  menuDanger: string;
  menuDangerHover: string;
  menuRadius: string;
  menuBoxShadow: string;
}

export const defaultTheme: EditorTheme = {
  pinColors: {
    exec: "#000000",
    string: "#ec4899",
    number: "#22c55e",
    boolean: "#ef4444",
    any: "#9ca3af",
  },
  nodeBackground: "#ffffff",
  nodeTextColor: "#3f3f46",
  nodeBorder: "#d4d4d8",
  nodeSelectedBorder: "#eab308",
  nodeBorderRadius: "12px",
  nodeBoxShadow: "0 4px 16px rgba(0,0,0,0.10)",
  canvasBackground: "#fafafa",
  canvasGrid: "#e4e4e7",
  menuBackground: "#ffffff",
  menuBorder: "#e4e4e7",
  menuText: "#18181b",
  menuTextMuted: "#71717a",
  menuItemHover: "#f4f4f5",
  menuAccent: "#3b82f6",
  menuDanger: "#dc2626",
  menuDangerHover: "#fef2f2",
  menuRadius: "8px",
  menuBoxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
};

export const PIN_COLORS: Record<PinType, string> = defaultTheme.pinColors;

// ─── Codegen context ──────────────────────────────────────────────────────────

/** Callback that walks exec edges from a given output handle and returns statements. */
export type TraverseFn = (sourceHandle: string) => Stmt[];

export interface GeneratorContext {
  getInput(handleId: string): Expr;
  getInputDefault(handleId: string, fallback: Expr): Expr;
}

export type NodeCodegenEvaluate<TData = Record<string, unknown>> = {
  evaluate: (node: { id: string; data: TData }, ctx: GeneratorContext) => Expr;
};

export type NodeCodegenExecute<TData = Record<string, unknown>> = {
  execute: (
    node: { id: string; data: TData },
    ctx: GeneratorContext,
    traverse: (handle: string) => import("./ast/types").Stmt[],
  ) => import("./ast/types").Stmt[];
};

export type NodeCodegen<TData = Record<string, unknown>> =
  | NodeCodegenExecute<TData>
  | NodeCodegenEvaluate<TData>;

export interface PinDef {
  id: string;
  label: string;
  type: PinType;
  multi?: boolean;
}

// Error reporting

export type EditorErrorKind =
  | "unknown_node_type"
  | "no_codegen"
  | "cycle"
  | "unsupported_ast_variant";

export interface EditorError {
  kind: EditorErrorKind;
  message: string;
  nodeId?: string;
}

export type ErrorReporter = (err: EditorError) => void;

export interface CodeBackend {
  language: string;
  emit(
    ast: { type: "Program"; body: unknown[] },
    onError?: ErrorReporter,
  ): string;
}

export interface NodeDefinition<TData = Record<string, unknown>> {
  type: string;
  label: string;
  category: string;
  color: string;
  inputs?: PinDef[];
  outputs?: PinDef[];
  defaultData?: Partial<TData>;
  component: React.ComponentType<NodeProps>;
  codegen: NodeCodegen<TData>;
  isEntry?: boolean;
}
