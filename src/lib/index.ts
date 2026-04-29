export { default as VisualEditor } from './VisualEditor';
export type { VisualEditorProps, VisualEditorHandle } from './VisualEditor';

export type {
  NodeDefinition,
  NodeCodegen,
  NodeCodegenExecute,
  NodeCodegenEvaluate,
  PinDef,
  PinType,
  GeneratorContext,
  TraverseFn,
  CodeBackend,
  EditorTheme,
  EditorError,
  EditorErrorKind,
  ErrorReporter,
} from './types';
export { defaultTheme, PIN_COLORS } from './types';

export { builtinNodes } from './builtins/index';

export { luaBackend } from './backends/lua';

export {
  id,
  literal,
  binaryOp,
  unaryOp,
  call,
  exprStmt,
  assign,
  localDecl,
  ifStmt,
  whileStmt,
  forStmt,
  returnStmt,
  funcDecl,
  program,
  mathCall,
} from './ast/builders';
export type { Expr, Stmt, Program } from './ast/types';

export { BaseNode } from './nodes/BaseNode';
export type { BaseNodeProps, Pin } from './nodes/BaseNode';
