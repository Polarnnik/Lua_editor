import { Node, Edge } from "@xyflow/react";
import { program } from "../ast/builders";
import { Program } from "../ast/types";
import { ASTTraverser } from "../ast/traverser";
import { NodeRegistry } from "../nodeRegistry";
import { CodeBackend } from "../types";

export class CodeGenerator {
  constructor(
    private registry: NodeRegistry,
    private backend: CodeBackend,
  ) {}

  generate(nodes: Node[], edges: Edge[]): string {
    const ast = this.buildAST(nodes, edges);
    return this.backend.emit(ast);
  }

  private buildAST(nodes: Node[], edges: Edge[]): Program {
    const entryTypes = new Set(
      this.registry.getEntryNodes().map((d) => d.type),
    );
    const entryNodes = nodes.filter(
      (n) => n.type !== undefined && entryTypes.has(n.type),
    );

    if (entryNodes.length === 0) return program([]);

    const traverser = new ASTTraverser(nodes, edges, this.registry);
    const allStatements = entryNodes.flatMap((entryNode) =>
      traverser.executeEntry(entryNode),
    );

    return program(allStatements);
  }
}
