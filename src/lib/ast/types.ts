export type LuaType =
  | 'nil'
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'table';

export interface LuaIdentifier {
  type: 'Identifier';
  name: string;
}

export interface LuaLiteral {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface LuaBinaryExpression {
  type: 'BinaryExpression';
  operator: string;
  left: LuaExpression;
  right: LuaExpression;
}

export interface LuaUnaryExpression {
  type: 'UnaryExpression';
  operator: string;
  argument: LuaExpression;
}

export interface LuaCallExpression {
  type: 'CallExpression';
  callee: LuaIdentifier | LuaIndexExpression | LuaMemberExpression;
  arguments: LuaExpression[];
}

export interface LuaIndexExpression {
  type: 'IndexExpression';
  object: LuaExpression;
  index: LuaExpression;
}

export interface LuaMemberExpression {
  type: 'MemberExpression';
  object: LuaExpression;
  property: string;
}

export interface LuaTableExpression {
  type: 'TableExpression';
  fields: Array<{ key?: LuaExpression; value: LuaExpression }>;
}

export type LuaExpression =
  | LuaIdentifier
  | LuaLiteral
  | LuaBinaryExpression
  | LuaUnaryExpression
  | LuaCallExpression
  | LuaTableExpression
  | LuaIndexExpression
  | LuaMemberExpression;

export interface LuaAssignmentExpression {
  type: 'AssignmentExpression';
  left: LuaIdentifier[];
  operator: string;
  right: LuaExpression[];
}

export interface LuaLocalDeclaration {
  type: 'LocalDeclaration';
  names: string[];
  values: LuaExpression[];
}

export interface LuaIfStatement {
  type: 'IfStatement';
  condition: LuaExpression;
  consequent: LuaStatement[];
  alternate: LuaStatement[];
}

export interface LuaWhileStatement {
  type: 'WhileStatement';
  condition: LuaExpression;
  body: LuaStatement[];
}

export interface LuaForStatement {
  type: 'ForStatement';
  variable: string;
  start: LuaExpression;
  end: LuaExpression;
  step?: LuaExpression;
  body: LuaStatement[];
}

export interface LuaFunctionDeclaration {
  type: 'FunctionDeclaration';
  name: string;
  params: string[];
  body: LuaStatement[];
}

export interface LuaReturnStatement {
  type: 'ReturnStatement';
  argument?: LuaExpression;
}

export interface LuaBreakStatement {
  type: 'BreakStatement';
}

export interface LuaExpressionStatement {
  type: 'ExpressionStatement';
  expression: LuaExpression;
}

export type LuaStatement =
  | LuaAssignmentExpression
  | LuaLocalDeclaration
  | LuaIfStatement
  | LuaWhileStatement
  | LuaForStatement
  | LuaFunctionDeclaration
  | LuaReturnStatement
  | LuaBreakStatement
  | LuaExpressionStatement;

export interface LuaProgram {
  type: 'Program';
  body: LuaStatement[];
}

export type Expr = LuaExpression;
export type Stmt = LuaStatement;
export type Program = LuaProgram;
