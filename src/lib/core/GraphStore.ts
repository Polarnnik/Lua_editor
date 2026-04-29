import { Node, Edge } from "@xyflow/react";

export interface GraphSnapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export class GraphStore {
  private history: GraphSnapshot[] = [];
  private cursor = -1;
  private onChange: (snap: GraphSnapshot) => void;

  constructor(initial: GraphSnapshot, onChange: (snap: GraphSnapshot) => void) {
    this.onChange = onChange;
    this.push(initial);
  }

  // Текущий снапшот
  get current(): GraphSnapshot {
    return this.history[this.cursor];
  }

  // Записать новое состояние (обрезает redo-ветку)
  push(snap: GraphSnapshot): void {
    // Отбрасываем всё что было после текущего курсора (redo-ветка)
    this.history = this.history.slice(0, this.cursor + 1);
    this.history.push(snap);
    // Ограничиваем размер истории
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

  // Загрузить внешний граф (сбрасывает историю)
  load(snap: GraphSnapshot): void {
    this.history = [snap];
    this.cursor = 0;
    this.onChange(snap);
  }
}
