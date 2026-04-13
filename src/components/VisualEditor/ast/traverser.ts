import { Node, Edge } from '@xyflow/react';
import { LuaExpression, LuaStatement } from './types';
import { GeneratorContext, NodeGenerator, TraverseFn } from '../generators/types';

const DEBUG = true;

function debug(label: string, ...args: any[]) {
  if (DEBUG) {
    console.log(`[AST] ${label}`, ...args);
  }
}

export class ASTTraverser {
  private nodes: Node[];
  private edges: Edge[];
  private generators: Record<string, NodeGenerator>;
  
  private evaluatedNodes: Map<string, LuaExpression> = new Map();

  constructor(nodes: Node[], edges: Edge[], generators: Record<string, NodeGenerator>) {
    this.nodes = nodes;
    this.edges = edges;
    this.generators = generators;
  }

  traverse(fromNodeId: string, sourceHandle: string): LuaStatement[] {
    const statements: LuaStatement[] = [];
    
    const outgoingEdges = this.edges.filter(e => 
      e.source === fromNodeId && e.sourceHandle === sourceHandle
    );
    
    debug(`  traverse("${sourceHandle}") от ${fromNodeId}, связей: ${outgoingEdges.length}`);

    for (const edge of outgoingEdges) {
      const targetNode = this.nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      const nodeStatements = this.generateNodeStatements(targetNode);
      statements.push(...nodeStatements);
    }

    return statements;
  }

  private generateNodeStatements(node: Node): LuaStatement[] {
    const generator = this.generators[node.type];
    if (!generator) {
      debug(`  Нет генератора для ${node.type}`);
      return [];
    }

    const ctx = this.createContext(node);

    if ('execute' in generator) {
      debug(`  ${node.type}: execute()`);
      return generator.execute(node, ctx, (handle) => this.traverse(node.id, handle));
    }

    return [];
  }

  evaluateExpression(node: Node): LuaExpression {
    const cached = this.evaluatedNodes.get(node.id);
    if (cached) return cached;

    const generator = this.generators[node.type];
    if (!generator || !('evaluate' in generator)) {
      return { type: 'Literal', value: null, raw: 'nil' };
    }

    const ctx = this.createContext(node);
    const result = generator.evaluate(node, ctx);
    
    this.evaluatedNodes.set(node.id, result);
    
    return result;
  }

  private createContext(node: Node): GeneratorContext {
    return {
      getInput: (handleId: string): LuaExpression => {
        const sourceNode = this.resolveSourceNode(node.id, handleId);
        if (!sourceNode) {
          debug(`  ctx.getInput("${handleId}"): нет связи -> nil`);
          return { type: 'Literal', value: null, raw: 'nil' };
        }
        
        debug(`  ctx.getInput("${handleId}"): от ${sourceNode.type} ${sourceNode.id}`);
        return this.evaluateExpression(sourceNode);
      },
      
      getInputDefault: (handleId: string, fallback: LuaExpression): LuaExpression => {
        const sourceNode = this.resolveSourceNode(node.id, handleId);
        if (!sourceNode) {
          debug(`  ctx.getInputDefault("${handleId}"): нет связи -> fallback`);
          return fallback;
        }
        
        return this.evaluateExpression(sourceNode);
      }
    };
  }

  
  // Находит исходный узел подключенный к указанному пину

  private resolveSourceNode(targetNodeId: string, targetHandleId: string): Node | null {
    const edge = this.edges.find(e => 
      e.target === targetNodeId && e.targetHandle === targetHandleId
    );
    
    if (!edge) return null;
    
    return this.nodes.find(n => n.id === edge.source) || null;
  }
}
