import { Connection, Edge, Node } from '@xyflow/react';
import { NodeRegistry } from '../nodeRegistry';
import { PinType } from '../types';

const COMPATIBLE: Record<PinType, PinType[]> = {
  exec: ['exec'],
  number: ['number', 'any'],
  string: ['string', 'any'],
  boolean: ['boolean', 'any'],
  any: ['exec', 'number', 'string', 'boolean', 'any'],
};

function typesCompatible(source: PinType, target: PinType): boolean {
  return COMPATIBLE[source]?.includes(target) ?? false;
}

function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: Edge[],
): boolean {
  const visited = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of edges) {
      if (edge.source === current) {
        stack.push(edge.target);
      }
    }
  }
  return false;
}

export class ConnectionValidator {
  constructor(private registry: NodeRegistry) {}

  isValid(connection: Connection, nodes: Node[], edges: Edge[]): boolean {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (source === target) return false;
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return false;
    const sourceDef = this.registry.get(sourceNode.type!);
    const targetDef = this.registry.get(targetNode.type!);
    if (!sourceDef || !targetDef) return false;
    const sourcePin = sourceDef.outputs?.find((p) => p.id === sourceHandle);
    const targetPin = targetDef.inputs?.find((p) => p.id === targetHandle);
    if (!sourcePin || !targetPin) return false;
    if (!typesCompatible(sourcePin.type, targetPin.type)) return false;
    // If source is exec, allow replacement (don't block by existing connection)
    if (sourcePin.type !== 'exec' && !targetPin.multi) {
      const alreadyConnected = edges.some(
        (e) => e.target === target && e.targetHandle === targetHandle,
      );
      if (alreadyConnected) return false;
    }
    if (wouldCreateCycle(source!, target!, edges)) return false;
    return true;
  }
}
