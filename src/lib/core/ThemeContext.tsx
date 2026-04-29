import React, { createContext, useContext, useMemo } from 'react';
import { EditorTheme, defaultTheme } from '../types';

const ThemeContext = createContext<EditorTheme>(defaultTheme);

// CSS переменные которые выставляются на корневом элементе редактора.
// Пользователь может переопределить их в своём CSS без каких-либо props:
//
//   .my-editor { --ve-node-bg: #1c1c1e; --ve-pin-number: #60a5fa; }
//
// Список переменных:
//   --ve-node-bg          фон карточки
//   --ve-node-text        цвет текста
//   --ve-node-border      цвет рамки
//   --ve-node-border-sel  цвет рамки выбранной ноды
//   --ve-node-radius      скругление углов
//   --ve-node-shadow      тень
//   --ve-pin-exec         цвет exec пина
//   --ve-pin-number       цвет number пина
//   --ve-pin-string       цвет string пина
//   --ve-pin-boolean      цвет boolean пина
//   --ve-pin-any          цвет any пина
//   --ve-canvas-bg        фон канваса
//   --ve-canvas-grid      цвет сетки

function toCSSVars(t: EditorTheme): React.CSSProperties {
  return {
    '--ve-node-bg':         t.nodeBackground,
    '--ve-node-text':       t.nodeTextColor,
    '--ve-node-border':     t.nodeBorder,
    '--ve-node-border-sel': t.nodeSelectedBorder,
    '--ve-node-radius':     t.nodeBorderRadius,
    '--ve-node-shadow':     t.nodeBoxShadow,
    '--ve-pin-exec':        t.pinColors.exec,
    '--ve-pin-number':      t.pinColors.number,
    '--ve-pin-string':      t.pinColors.string,
    '--ve-pin-boolean':     t.pinColors.boolean,
    '--ve-pin-any':         t.pinColors.any,
    '--ve-canvas-bg':       t.canvasBackground,
    '--ve-canvas-grid':     t.canvasGrid,
  } as React.CSSProperties;
}

export function ThemeProvider({
  theme,
  children,
}: {
  theme: EditorTheme;
  children: React.ReactNode;
}) {
  const cssVars = useMemo(() => toCSSVars(theme), [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ ...cssVars, width: '100%', height: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useEditorTheme(): EditorTheme {
  return useContext(ThemeContext);
}
