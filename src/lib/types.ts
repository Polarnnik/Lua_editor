import React from "react";
import { NodeProps } from "@xyflow/react";
import { Expr, Stmt } from "./ast/types";

export type PinType = "exec" | "string" | "number" | "boolean" | "any";

export const PIN_COLORS: Record<PinType, string> = {
  exec: "#000000",
  string: "#ec4899",
  number: "#22c55e",
  boolean: "#ef4444",
  any: "#9ca3af",
};

export type TraverseFn = (sourceHandle: string) => Stmt[];

export interface GeneratorContext {
  getInput(handleId: string): Expr;
  getInputDefault(handleId: string, fallback: Expr): Expr;
}

export type NodeCodegenExecute<TData = Record<string, unknown>> = {
  execute: (
    node: { id: string; data: TData },
    ctx: GeneratorContext,
    traverse: TraverseFn,
  ) => Stmt[];
};

export type NodeCodegenEvaluate<TData = Record<string, unknown>> = {
  evaluate: (node: { id: string; data: TData }, ctx: GeneratorContext) => Expr;
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

export interface CodeBackend {
  language: string;
  emit(ast: { type: "Program"; body: unknown[] }): string;
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
}
