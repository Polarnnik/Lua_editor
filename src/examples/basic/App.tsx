import { useRef, useState } from 'react';
import {
  VisualEditor,
  VisualEditorHandle,
  builtinNodes,
  luaBackend,
  EditorTheme,
} from '../../lib';

// ── Пример кастомной тёмной темы ─────────────────────────────────────────────
const darkTheme: Partial<EditorTheme> = {
  nodeBackground: '#1c1c1e',
  nodeTextColor: '#e4e4e7',
  nodeBorder: '#3f3f46',
  nodeSelectedBorder: '#facc15',
  nodeBorderRadius: '8px',
  nodeBoxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  canvasBackground: '#141414',
  canvasGrid: '#27272a',
  pinColors: {
    exec: '#e4e4e7',
    string: '#f472b6',
    number: '#4ade80',
    boolean: '#f87171',
    any: '#71717a',
  },
  menuBackground: '#1c1c1e',
  menuBorder: '#3f3f46',
  menuText: '#e4e4e7',
  menuTextMuted: '#71717a',
  menuItemHover: '#27272a',
  menuAccent: '#60a5fa',
  menuDanger: '#f87171',
  menuDangerHover: '#2d1515',
  menuRadius: '8px',
};

// ── Пример использования библиотеки ──────────────────────────────────────────
// Этот файл — НЕ часть библиотеки.
// Показывает как интегрировать VisualEditor в своё приложение.

export default function App() {
  const editorRef = useRef<VisualEditorHandle>(null);
  const [code, setCode] = useState(
    '-- ПКМ на холсте — добавить узел\n' +
      '-- ПКМ на узле/связи — удалить\n' +
      '-- Ctrl+Z / Ctrl+Y — undo/redo\n' +
      '-- Нажмите "Генерировать" чтобы получить Lua код',
  );
  const [dark, setDark] = useState(false);

  const handleGenerate = () => {
    const result = editorRef.current?.generate();
    if (result) setCode(result);
  };

  const handleSave = () => {
    const graph = editorRef.current?.getGraph();
    if (graph) localStorage.setItem('ve-graph', JSON.stringify(graph));
  };

  const handleLoad = () => {
    const raw = localStorage.getItem('ve-graph');
    if (raw) editorRef.current?.loadGraph(JSON.parse(raw));
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden font-sans">
      {/* Редактор занимает всё свободное пространство */}
      <div className="flex-1 min-w-0">
        <VisualEditor
          ref={editorRef}
          nodes={builtinNodes}
          backend={luaBackend}
          theme={dark ? darkTheme : undefined}
        />
      </div>

      {/* Правая панель — часть примера, не библиотеки */}
      <div className="w-80 shrink-0 bg-white border-l border-zinc-200 flex flex-col">
        <div className="px-3 py-2 border-b border-zinc-200 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => editorRef.current?.undo()}
            title="Ctrl+Z"
            className="text-xs px-2 py-1.5 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            ↩ Undo
          </button>
          <button
            onClick={() => editorRef.current?.redo()}
            title="Ctrl+Y"
            className="text-xs px-2 py-1.5 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            ↪ Redo
          </button>
          <button
            onClick={handleSave}
            className="text-xs px-2 py-1.5 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            💾 Save
          </button>
          <button
            onClick={handleLoad}
            className="text-xs px-2 py-1.5 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            📂 Load
          </button>
          <button
            onClick={() => setDark((d) => !d)}
            className="text-xs px-2 py-1.5 rounded border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={handleGenerate}
            className="ml-auto bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
          >
            Генерировать
          </button>
        </div>

        <pre className="flex-1 p-4 font-mono text-xs text-emerald-700 overflow-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}
