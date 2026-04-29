import { Connection, Edge, Node } from '@xyflow/react';
import { NodeRegistry } from '../nodeRegistry';
import { PinType } from '../types';

// ─── Таблица совместимости типов пинов ───────────────────────────────────────
// any совместим со всем. exec — только с exec.
// number/string/boolean совместимы между собой только через any.

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

// ─── Cycle check (DFS) ────────────────────────────────────────────────────────
// Проверяем: если добавить ребро source→target, не появится ли цикл.
// Идём от target вперёд по существующим рёбрам — если дойдём до source, цикл.

function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: Edge[]
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

// ─── ConnectionValidator ──────────────────────────────────────────────────────

export class ConnectionValidator {
  constructor(private registry: NodeRegistry) {}

  isValid(connection: Connection, nodes: Node[], edges: Edge[]): boolean {
    const { source, target, sourceHandle, targetHandle } = connection;

    // 1. Self-loop
    if (source === target) return false;

    // 2. Оба конца должны существовать
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return false;

    // 3. Получаем определения узлов
    const sourceDef = this.registry.get(sourceNode.type!);
    const targetDef = this.registry.get(targetNode.type!);
    if (!sourceDef || !targetDef) return false;

    // 4. Находим пины
    const sourcePin = sourceDef.outputs?.find((p) => p.id === sourceHandle);
    const targetPin = targetDef.inputs?.find((p) => p.id === targetHandle);
    if (!sourcePin || !targetPin) return false;

    // 5. Проверяем совместимость типов
    if (!typesCompatible(sourcePin.type, targetPin.type)) return false;

    // 6. Если пин не multi — проверяем что входящего ребра ещё нет
    if (!targetPin.multi) {
      const alreadyConnected = edges.some(
        (e) => e.target === target && e.targetHandle === targetHandle
      );
      if (alreadyConnected) return false;
    }

    // 7. Проверяем что не создаём цикл
    if (wouldCreateCycle(source!, target!, edges)) return false;

    return true;
  }
}
