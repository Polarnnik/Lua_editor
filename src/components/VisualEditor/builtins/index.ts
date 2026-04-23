import { NodeDefinition } from "../types";
import { eventStartDef } from "../nodes/EventNode";
import { actionPrintDef } from "../nodes/ActionNode";
import { valueStringDef, valueNumberDef } from "../nodes/ValueNode";
import { logicIfDef } from "../nodes/LogicNode";
import { mathNodeDef } from "../nodes/MathNode";
import { compareNodeDef } from "../nodes/CompareNode";

export const builtinNodes: NodeDefinition[] = [
  eventStartDef,
  actionPrintDef,
  valueStringDef,
  valueNumberDef,
  logicIfDef,
  compareNodeDef,
  mathNodeDef,
];
