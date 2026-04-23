import { Node, Edge } from "@xyflow/react";
import { program, funcDecl } from "../ast/builders";
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
    const startNodes = nodes.filter((n) => n.type === "event_start");
    if (startNodes.length === 0) return program([]);

    const allStatements = startNodes.flatMap((startNode) => {
      const traverser = new ASTTraverser(nodes, edges, this.registry);
      return traverser.traverse(startNode.id, "exec_out");
    });

    return program([funcDecl("onStart", [], allStatements)]);
  }
}
