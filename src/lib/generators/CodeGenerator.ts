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
    const entryTypes = new Set(
      this.registry.getEntryNodes().map((d) => d.type),
    );
    const entryNodes = nodes.filter(
      (n) => n.type !== undefined && entryTypes.has(n.type),
    );

    if (entryNodes.length === 0) return program([]);

    const allStatements = entryNodes.flatMap((entryNode) => {
      const traverser = new ASTTraverser(nodes, edges, this.registry);

      if (entryNode.type === "event_start") {
        // event_start wraps its body in onStart() — it has no codegen of its own.
        const body = traverser.traverse(entryNode.id, "exec_out");
        return [funcDecl("onStart", [], body)];
      }

      return traverser.executeEntry(entryNode);
    });

    return program(allStatements);
  }
}
