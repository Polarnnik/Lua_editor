import React from "react";
import { NodeProps } from "@xyflow/react";
import { NodeDefinition } from "./types";

export class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();

  init(defs: NodeDefinition[]): void {
    this.nodes.clear();
    for (const def of defs) {
      if (this.nodes.has(def.type)) {
        console.warn(
          `[NodeRegistry] Дублирующийся тип узла: "${def.type}". Перезаписывается.`,
        );
      }
      this.nodes.set(def.type, def);
    }
  }

  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  getReactFlowTypes(): Record<string, React.ComponentType<NodeProps>> {
    const types: Record<string, React.ComponentType<NodeProps>> = {};
    for (const [type, def] of this.nodes) {
      types[type] = def.component;
    }
    return types;
  }

  getCategories(): Record<string, NodeDefinition[]> {
    const categories: Record<string, NodeDefinition[]> = {};
    for (const def of this.nodes.values()) {
      if (!categories[def.category]) categories[def.category] = [];
      categories[def.category].push(def);
    }
    return categories;
  }
}
