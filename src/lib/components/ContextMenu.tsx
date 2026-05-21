import React, { useEffect, useRef, useState } from 'react';
import { NodeDefinition, PinType } from '../types';

export type ContextMenuState =
  | {
      kind: 'canvas';
      x: number;
      y: number;
      flowX: number;
      flowY: number;
      pinFilter?: PinType;
    }
  | { kind: 'node'; x: number; y: number; nodeId: string }
  | { kind: 'edge'; x: number; y: number; edgeId: string }
  | null;

interface ContextMenuProps {
  menu: ContextMenuState;
  categories: Record<string, NodeDefinition[]>;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onPaste: (position: { x: number; y: number }) => void;
  hasClipboard: boolean;
  onClose: () => void;
}

export function ContextMenu({
  menu,
  categories,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onCopyNode,
  onPaste,
  hasClipboard,
  onClose,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menu) {
      setSearch('');
      return;
    }
    if (menu.kind === 'canvas') {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    const handleMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement))
        onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: menu.y,
    left: menu.x,
    zIndex: 1000,
  };

  // ── Канвас — добавление узлов ─────────────────────────────────────────────
  if (menu.kind === 'canvas') {
    const pos = { x: menu.flowX, y: menu.flowY };
    const pinFilter = menu.pinFilter;
    const query = search.trim().toLowerCase();

    const filtered = Object.fromEntries(
      Object.entries(categories)
        .map(([cat, defs]) => [
          cat,
          defs.filter((def) => {
            const matchesSearch =
              !query || def.label?.toLowerCase().includes(query);
            // Если drag от пина — фильтруем по совместимым пинам
            const matchesPin =
              !pinFilter || pinFilter === 'exec'
                ? !pinFilter || def.inputs?.some((p) => p.type === pinFilter)
                : def.inputs?.some(
                    (p) => p.type === pinFilter || p.type === 'any',
                  );
            return matchesSearch && matchesPin;
          }),
        ])
        .filter(([, defs]) => (defs as NodeDefinition[]).length > 0),
    );

    const hasResults = Object.keys(filtered).length > 0;

    return (
      <div ref={ref} style={style} className="context-menu">
        <div className="context-menu__header">
          {pinFilter ? `Подключить к ${pinFilter}` : 'Добавить узел'}
        </div>
        <input
          ref={searchRef}
          type="text"
          className="context-menu__search"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Вставить если есть в буфере */}
        {hasClipboard && !pinFilter && (
          <>
            <div className="context-menu__category">Буфер</div>
            <button
              className="context-menu__item"
              onClick={() => {
                onPaste(pos);
                onClose();
              }}
            >
              📋 Вставить
            </button>
          </>
        )}
        {hasResults ? (
          (Object.entries(filtered) as [string, NodeDefinition[]][]).map(
            ([cat, defs]) => (
              <div key={cat}>
                <div className="context-menu__category">{cat}</div>
                {defs.map((def) => (
                  <button
                    key={def.type}
                    className="context-menu__item"
                    onClick={() => {
                      onAddNode(def.type, pos);
                      onClose();
                    }}
                  >
                    <span
                      className="context-menu__dot"
                      style={{ background: def.color }}
                    />
                    {def.label}
                  </button>
                ))}
              </div>
            ),
          )
        ) : (
          <div className="context-menu__no-results">Нет результатов</div>
        )}
      </div>
    );
  }

  // ── Узел ──────────────────────────────────────────────────────────────────
  if (menu.kind === 'node') {
    return (
      <div ref={ref} style={style} className="context-menu">
        <button
          className="context-menu__item"
          onClick={() => {
            onDuplicateNode(menu.nodeId);
            onClose();
          }}
        >
          ⧉ Дублировать
        </button>
        <button
          className="context-menu__item"
          onClick={() => {
            onCopyNode(menu.nodeId);
            onClose();
          }}
        >
          📋 Копировать
        </button>
        <div
          style={{
            height: 1,
            background: 'var(--ve-menu-border, #e4e4e7)',
            margin: '4px 0',
          }}
        />
        <button
          className="context-menu__item context-menu__item--danger"
          onClick={() => {
            onDeleteNode(menu.nodeId);
            onClose();
          }}
        >
          Удалить узел
        </button>
      </div>
    );
  }

  // ── Ребро ─────────────────────────────────────────────────────────────────
  return (
    <div ref={ref} style={style} className="context-menu">
      <button
        className="context-menu__item context-menu__item--danger"
        onClick={() => {
          onDeleteEdge(menu.edgeId);
          onClose();
        }}
      >
        Удалить связь
      </button>
    </div>
  );
}
