# lua-editor

Визуальный редактор графов с генерацией Lua-кода. Построен на React 19, TypeScript, `@xyflow/react`.

## Использование

```tsx
import { VisualEditor, builtinNodes, luaBackend } from 'lua-editor';

function App() {
  return <VisualEditor nodes={builtinNodes} backend={luaBackend} />;
}
```

## Разработка (демо-приложение)

```bash
npm run dev        # Запуск демо на порту 3000
```

## Сборка библиотеки

```bash
npm run build      # Сборка библиотеки в dist/
```

Результат сборки:

- `dist/index.mjs` — ES-модуль
- `dist/index.cjs` — CommonJS-модуль
- `dist/index.d.ts` — декларации типов

### Установка в потребителе

```bash
npm install lua-editor
```

Пир-зависимости, которые должны быть установлены в проекте-потребителе:

- `react` ^19
- `react-dom` ^19
- `@xyflow/react` ^12

```tsx
import { VisualEditor, builtinNodes, luaBackend } from 'lua-editor';
```

### Сборка демо-приложения

```bash
npm run build:example   # Сборка в dist-example/
```
