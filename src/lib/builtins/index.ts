import { NodeDefinition } from "../types";
import { commentNodeDef } from "../nodes/CommentNode";
import { eventStartDef } from "../nodes/EventNode";
import { actionPrintDef } from "../nodes/ActionNode";
import { valueStringDef, valueNumberDef } from "../nodes/ValueNode";
import { mathNodeDef } from "../nodes/MathNode";
import { logicIfDef } from "../nodes/LogicNode";
import { compareNodeDef } from "../nodes/CompareNode";
import { trigNodeDef, powerNodeDef, bitNodeDef, clampNodeDef } from "../nodes/MathAdvancedNode";
import { functionDeclDef, callFunctionDef, getParamDef } from "../nodes/FunctionNode";
import { varDeclDef, varGetDef, varSetDef } from "../nodes/VariableNodes";
import { whileNodeDef, forNodeDef, returnNodeDef } from "../nodes/FlowControlNodes";
import { boolNodeDef, notNodeDef, boolOpNodeDef } from "../nodes/LogicNodes";
import { concatNodeDef, strLenNodeDef, convertNodeDef } from "../nodes/StringNodes";

export const builtinNodes: NodeDefinition<any>[] = [
  // Events
  eventStartDef,
  // Functions
  functionDeclDef,
  callFunctionDef,
  getParamDef,
  // Actions
  actionPrintDef,
  // Values
  valueStringDef,
  valueNumberDef,
  boolNodeDef,
  // Math
  mathNodeDef,
  trigNodeDef,
  powerNodeDef,
  bitNodeDef,
  clampNodeDef,
  // Logic
  logicIfDef,
  compareNodeDef,
  notNodeDef,
  boolOpNodeDef,
  // Control flow
  whileNodeDef,
  forNodeDef,
  returnNodeDef,
  // Variables
  varDeclDef,
  varGetDef,
  varSetDef,
  // Strings
  concatNodeDef,
  strLenNodeDef,
  // Utils
  convertNodeDef,
  commentNodeDef,
];
