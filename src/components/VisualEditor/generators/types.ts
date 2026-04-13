import { Node, Edge } from '@xyflow/react';
import { LuaExpression, LuaStatement } from '../ast';

export type TraverseFn = (sourceHandle: string) => LuaStatement[];

export interface GeneratorContext {
  getInput(handleId: string): LuaExpression;
  getInputDefault(handleId: string, fallback: LuaExpression): LuaExpression;
}

export interface NodeExecuteGenerator {
  execute: (node: Node, ctx: GeneratorContext, traverse: TraverseFn) => LuaStatement[];
}

export interface NodeEvaluateGenerator {
  evaluate: (node: Node, ctx: GeneratorContext) => LuaExpression;
}

export type NodeGenerator = NodeExecuteGenerator | NodeEvaluateGenerator;

export interface GeneratorBackend {
  language: string;
  register(type: string, generator: NodeGenerator): void;
  get(type: string): NodeGenerator | undefined;
  getAll(): Record<string, NodeGenerator>;
}

export function createGeneratorBackend(language: string): GeneratorBackend {
  const generators: Record<string, NodeGenerator> = {};

  return {
    language,
    register(type, generator) {
      generators[type] = generator;
    },
    get(type) {
      return generators[type];
    },
    getAll() {
      return { ...generators };
    }
  };
}
