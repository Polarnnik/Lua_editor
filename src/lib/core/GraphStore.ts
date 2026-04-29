import { Node, Edge } from '@xyflow/react';

export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface GraphSnapshot {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

export interface LiveSnapshot {
  nodes: Node[];
  edges: Edge[];
}

export function toGraphSnapshot(live: LiveSnapshot): GraphSnapshot {
  return {
    nodes: live.nodes.map((n) => ({
      id: n.id,
      type: n.type ?? '',
      position: n.position,
      data: (n.data as Record<string, unknown>) ?? {},
    })),
    edges: live.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? '',
      targetHandle: e.targetHandle ?? '',
    })),
  };
}

export function fromGraphSnapshot(snap: GraphSnapshot): LiveSnapshot {
  return {
    nodes: snap.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: snap.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })),
  };
}

const MAX_HISTORY = 50;

export class GraphStore {
  private history: LiveSnapshot[] = [];
  private cursor = -1;
  private onChange: (snap: LiveSnapshot) => void;

  constructor(initial: LiveSnapshot, onChange: (snap: LiveSnapshot) => void) {
    this.onChange = onChange;
    this.push(initial);
  }

  get current(): LiveSnapshot {
    return this.history[this.cursor];
  }

  push(snap: LiveSnapshot): void {
    this.history = this.history.slice(0, this.cursor + 1);
    this.history.push(snap);
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
    this.cursor = this.history.length - 1;
  }

  canUndo(): boolean {
    return this.cursor > 0;
  }

  canRedo(): boolean {
    return this.cursor < this.history.length - 1;
  }

  undo(): void {
    if (!this.canUndo()) return;
    this.cursor--;
    this.onChange(this.current);
  }

  redo(): void {
    if (!this.canRedo()) return;
    this.cursor++;
    this.onChange(this.current);
  }

  load(snap: LiveSnapshot): void {
    this.history = [snap];
    this.cursor = 0;
    this.onChange(snap);
  }
}
