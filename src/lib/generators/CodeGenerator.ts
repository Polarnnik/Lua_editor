import { Node, Edge } from '@xyflow/react';
import { program } from '../ast/builders';
import { Program } from '../ast/types';
import { ASTTraverser } from '../ast/traverser';
import { NodeRegistry } from '../nodeRegistry';
import { CodeBackend, ErrorReporter } from '../types';

export class CodeGenerator {
  constructor(
    private registry: NodeRegistry,
    private backend: CodeBackend,
    private onError?: ErrorReporter
  ) {}

  generate(nodes: Node[], edges: Edge[]): string {
    const ast = this.buildAST(nodes, edges);
    return this.backend.emit(ast, this.onError);
  }

  private buildAST(nodes: Node[], edges: Edge[]): Program {
    const entryTypes = new Set(
      this.registry.getEntryNodes().map((d) => d.type)
    );
    const entryNodes = nodes.filter(
      (n) => n.type !== undefined && entryTypes.has(n.type)
    );

    if (entryNodes.length === 0) return program([]);

    // Every entry node is fully responsible for its own code shape via its
    // `execute` codegen. No special-casing per node type here.
    const traverser = new ASTTraverser(
      nodes,
      edges,
      this.registry,
      this.onError
    );
    const allStatements = entryNodes.flatMap((entryNode) =>
      traverser.executeEntry(entryNode)
    );

    return program(allStatements);
  }
}
