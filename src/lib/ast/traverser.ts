import { Node, Edge } from '@xyflow/react';
import { Expr, Stmt } from './types';
import { GeneratorContext, NodeCodegen } from '../types';
import { NodeRegistry } from '../nodeRegistry';

// ASTTraverser больше не принимает отдельный generators map.
// Он получает NodeRegistry и достаёт codegen прямо из NodeDefinition.

export class ASTTraverser {
  private nodes: Node[];
  private edges: Edge[];
  private registry: NodeRegistry;
  private evaluatedNodes: Map<string, Expr> = new Map();

  constructor(nodes: Node[], edges: Edge[], registry: NodeRegistry) {
    this.nodes = nodes;
    this.edges = edges;
    this.registry = registry;
  }

  traverse(fromNodeId: string, sourceHandle: string): Stmt[] {
    const statements: Stmt[] = [];

    const outgoingEdges = this.edges.filter(
      (e) => e.source === fromNodeId && e.sourceHandle === sourceHandle,
    );

    for (const edge of outgoingEdges) {
      const targetNode = this.nodes.find((n) => n.id === edge.target);
      if (!targetNode) continue;
      statements.push(...this.executeNode(targetNode));
    }

    return statements;
  }

  private executeNode(node: Node): Stmt[] {
    const def = this.registry.get(node.type!);
    if (!def) return [];

    const codegen = def.codegen as NodeCodegen;
    if (!('execute' in codegen)) return [];

    const ctx = this.createContext(node);
    return codegen.execute(
      node as any,
      ctx,
      (handle) => this.traverse(node.id, handle),
    );
  }

  evaluateExpression(node: Node): Expr {
    const cached = this.evaluatedNodes.get(node.id);
    if (cached) return cached;

    const def = this.registry.get(node.type!);
    if (!def) return { type: 'Literal', value: null, raw: 'nil' };

    const codegen = def.codegen as NodeCodegen;
    if (!('evaluate' in codegen)) return { type: 'Literal', value: null, raw: 'nil' };

    const ctx = this.createContext(node);
    const result = codegen.evaluate(node as any, ctx);
    this.evaluatedNodes.set(node.id, result);
    return result;
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

  private resolveSourceNode(targetNodeId: string, targetHandleId: string): Node | null {
    const edge = this.edges.find(
      (e) => e.target === targetNodeId && e.targetHandle === targetHandleId,
    );
    if (!edge) return null;
    return this.nodes.find((n) => n.id === edge.source) || null;
  }
}
