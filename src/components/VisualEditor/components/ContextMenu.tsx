import React, { useEffect, useRef, useState } from 'react';
import { NodeDefinition } from '../types';

export type ContextMenuState =
  | { kind: 'canvas'; x: number; y: number; flowX: number; flowY: number }
  | { kind: 'node';   x: number; y: number; nodeId: string }
  | { kind: 'edge';   x: number; y: number; edgeId: string }
  | null;

interface ContextMenuProps {
  menu: ContextMenuState;
  categories: Record<string, NodeDefinition[]>;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}

// ─── ContextMenu ──────────────────────────────────────────────────────────────

export function ContextMenu({
  menu,
  categories,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  onClose,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  // Закрыть по клику вне меню
  useEffect(() => {
    if (!menu) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menu, onClose]);

  // Закрыть по Escape
  useEffect(() => {
    if (!menu) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [menu, onClose]);

  if (!menu) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: menu.y,
    left: menu.x,
    zIndex: 1000,
  };

  const query = search.trim().toLowerCase();

  const filteredCategories = query
    ? Object.fromEntries(
        Object.entries(categories)
          .map(([category, defs]) => [
            category,
            defs.filter((def) => def.label?.toLowerCase().includes(query)),
          ])
          .filter(([, defs]) => (defs as NodeDefinition[]).length > 0)
      )
    : categories;

  const hasResults = Object.keys(filteredCategories).length > 0;

  // ── Меню на пустом холсте — добавление узлов ─────────────────────────────
  if (menu.kind === 'canvas') {
    const pos = { x: menu.flowX, y: menu.flowY };
    return (
      <div ref={ref} style={style} className="context-menu">
        <div className="context-menu__header">Добавить узел</div>
        <input
          type="text"
          className="context-menu__search"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {hasResults ? (
          (Object.entries(filteredCategories) as [string, NodeDefinition[]][]).map(([category, defs]) => (
            <div key={category}>
              <div className="context-menu__category">{category}</div>
              {defs.map((def) => (
                <button
                  key={def.type}
                  className="context-menu__item"
                  onClick={() => { onAddNode(def.type, pos); onClose(); }}
                >
                  <span
                    className="context-menu__dot"
                    style={{ background: def.color }}
                  />
                  {def.label}
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className="context-menu__no-results">Нет результатов</div>
        )}
      </div>
    );
  }

  // ── Меню на узле / ребре — удаление ──────────────────────────────────────
  return (
    <div ref={ref} style={style} className="context-menu">
      {menu.kind === 'node' && (
        <button
          className="context-menu__item context-menu__item--danger"
          onClick={() => { onDeleteNode(menu.nodeId); onClose(); }}
        >
          Удалить узел
        </button>
      )}
      {menu.kind === 'edge' && (
        <button
          className="context-menu__item context-menu__item--danger"
          onClick={() => { onDeleteEdge(menu.edgeId); onClose(); }}
        >
          Удалить связь
        </button>
      )}
    </div>
  );
}
