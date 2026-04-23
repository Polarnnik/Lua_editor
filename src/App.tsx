import { useState } from 'react';
import VisualEditor from './components/VisualEditor';
import { builtinNodes } from './components/VisualEditor/builtins';
import { luaBackend } from './components/VisualEditor/backends/lua';

// App — пример использования библиотеки.
// Пользователь передаёт узлы и backend, получает готовый код через onCodeChange.
// Ничего из внутренностей редактора здесь не импортируется.

export default function App() {
  const [code, setCode] = useState('-- ПКМ на холсте — добавить узел\n-- ПКМ на узле/связи — удалить');

  return (
    <div className="flex w-screen h-screen overflow-hidden font-sans">
      <div className="flex-1 min-w-0">
        <VisualEditor
          nodes={builtinNodes}
          backend={luaBackend}
          onCodeChange={setCode}
        />
      </div>

      {/* Панель с кодом — это App, не библиотека */}
      <div className="w-80 shrink-0 bg-white border-l border-zinc-200 flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-200">
          <span className="text-sm font-semibold text-zinc-700">Lua</span>
        </div>
        <pre className="flex-1 p-4 font-mono text-xs text-emerald-700 overflow-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}
