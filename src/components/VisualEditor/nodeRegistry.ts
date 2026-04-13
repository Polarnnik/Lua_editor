import React from 'react';
import { NodeProps } from '@xyflow/react';
import { PinType } from './types';

export interface Pin {
  id: string;
  label: string;
  type: PinType;
}

export interface NodeDefinition {
  type: string;
  label: string;
  color: string;
  inputs?: Pin[];
  outputs?: Pin[];
  component: React.ComponentType<NodeProps>;
  defaultData?: Record<string, unknown>;
}

class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();

  register(definition: NodeDefinition): void {
    if (this.nodes.has(definition.type)) {
      console.warn(`Node type "${definition.type}" is already registered. Overwriting.`);
    }
    this.nodes.set(definition.type, definition);
  }

  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  getNodeTypes(): Record<string, React.ComponentType<NodeProps>> {
    const types: Record<string, React.ComponentType<NodeProps>> = {};
    for (const [type, def] of this.nodes) {
      types[type] = def.component;
    }
    return types;
  }
}

export const nodeRegistry = new NodeRegistry();
