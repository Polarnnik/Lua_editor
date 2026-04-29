import { Node, Edge } from '@xyflow/react';
import { Expr, Stmt } from './types';
import { GeneratorContext, NodeCodegen, ErrorReporter } from '../types';
import { NodeRegistry } from '../nodeRegistry';

export class ASTTraverser {
  private nodes: Node[];
  private edges: Edge[];
  private registry: NodeRegistry;
  private onError?: ErrorReporter;

  private evaluatedNodes: Map<string, Expr> = new Map();

  private evaluating: Set<string> = new Set();

  constructor(
    nodes: Node[],
    edges: Edge[],
    registry: NodeRegistry,
    onError?: ErrorReporter
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.registry = registry;
    this.onError = onError;
  }

  traverse(fromNodeId: string, sourceHandle: string): Stmt[] {
    const statements: Stmt[] = [];

    const outgoingEdges = this.edges.filter(
      (e) => e.source === fromNodeId && e.sourceHandle === sourceHandle
    );

    for (const edge of outgoingEdges) {
      const targetNode = this.nodes.find((n) => n.id === edge.target);
      if (!targetNode) continue;
      statements.push(...this.executeNode(targetNode));
    }

    return statements;
  }

  executeEntry(node: Node): Stmt[] {
    return this.executeNode(node);
  }

  private executeNode(node: Node): Stmt[] {
    const def = this.registry.get(node.type ?? '');
    if (!def) {
      this.onError?.({
        kind: 'unknown_node_type',
        message: `Узел "${node.id}" имеет неизвестный тип "${node.type ?? '<undefined>'}" — пропущен.`,
        nodeId: node.id,
      });
      return [];
    }

    const codegen = def.codegen as NodeCodegen;
    if (!('execute' in codegen)) {
      this.onError?.({
        kind: 'no_codegen',
        message: `Узел "${node.id}" (${node.type}) находится в потоке выполнения, но определяет только evaluate, не execute — пропущен.`,
        nodeId: node.id,
      });
      return [];
    }

    const ctx = this.createContext(node);
    return codegen.execute(
      node as Parameters<typeof codegen.execute>[0],
      ctx,
      (handle) => this.traverse(node.id, handle)
    );
  }

  evaluateExpression(node: Node): Expr {
    const cached = this.evaluatedNodes.get(node.id);
    if (cached) return cached;

    if (this.evaluating.has(node.id)) {
      this.onError?.({
        kind: 'cycle',
        message: `Обнаружен цикл в выражении на узле "${node.id}" (${node.type}). Возвращено nil.`,
        nodeId: node.id,
      });
      return { type: 'Literal', value: null, raw: 'nil' };
    }

    const def = this.registry.get(node.type ?? '');
    if (!def) {
      this.onError?.({
        kind: 'unknown_node_type',
        message: `Узел "${node.id}" имеет неизвестный тип "${node.type ?? '<undefined>'}" — возвращено nil.`,
        nodeId: node.id,
      });
      return { type: 'Literal', value: null, raw: 'nil' };
    }

    const codegen = def.codegen as NodeCodegen;
    if (!('evaluate' in codegen)) {
      this.onError?.({
        kind: 'no_codegen',
        message: `Узел "${node.id}" (${node.type}) используется как выражение, но определяет только execute, не evaluate — возвращено nil.`,
        nodeId: node.id,
      });
      return { type: 'Literal', value: null, raw: 'nil' };
    }

    this.evaluating.add(node.id);
    try {
      const ctx = this.createContext(node);
      const result = codegen.evaluate(
        node as Parameters<typeof codegen.evaluate>[0],
        ctx
      );
      this.evaluatedNodes.set(node.id, result);
      return result;
    } finally {
      this.evaluating.delete(node.id);
    }
  }

  private createContext(node: Node): GeneratorContext {
    return {
      getInput: (handleId: string): Expr => {
        const sourceNode = this.resolveSourceNode(node.id, handleId);
        if (!sourceNode) return { type: 'Literal', value: null, raw: 'nil' };
        return this.evaluateExpression(sourceNode);
      },
      getInputDefault: (handleId: string, fallback: Expr): Expr => {
        const sourceNode = this.resolveSourceNode(node.id, handleId);
        if (!sourceNode) return fallback;
        return this.evaluateExpression(sourceNode);
      },
    };
  }

  private resolveSourceNode(
    targetNodeId: string,
    targetHandleId: string
  ): Node | null {
    const edge = this.edges.find(
      (e) => e.target === targetNodeId && e.targetHandle === targetHandleId
    );
    if (!edge) return null;
    return this.nodes.find((n) => n.id === edge.source) ?? null;
  }
}
