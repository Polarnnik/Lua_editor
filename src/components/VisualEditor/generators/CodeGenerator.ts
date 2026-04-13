import { Node, Edge } from '@xyflow/react';
import { 
  LuaProgram, 
  program,
  funcDecl,
  generateLua,
  ASTTraverser
} from '../ast';
import { GeneratorBackend } from './types';

const DEBUG = true;

function debugAST(label: string, ast: any, depth = 0): string {
  const indent = '  '.repeat(depth);
  if (!DEBUG) return '';
  
  if (ast === null || ast === undefined) {
    return indent + label + ': null\n';
  }
  
  if (Array.isArray(ast)) {
    return indent + label + ': [\n' + 
      ast.map((item, i) => debugAST(`[${i}]`, item, depth + 1)).join('') + 
      indent + ']\n';
  }
  
  if (typeof ast === 'object' && ast.type) {
    let result = indent + label + ': {\n';
    result += indent + '  type: "' + ast.type + '",\n';
    for (const key of Object.keys(ast)) {
      if (key === 'type') continue;
      if (Array.isArray(ast[key])) {
        result += debugAST(key, ast[key], depth + 1);
      } else if (typeof ast[key] === 'object' && ast[key] !== null) {
        result += indent + '  ' + key + ': {...},\n';
      } else {
        result += indent + '  ' + key + ': ' + JSON.stringify(ast[key]) + ',\n';
      }
    }
    result += indent + '}\n';
    return result;
  }
  
  return indent + label + ': ' + JSON.stringify(ast) + '\n';
}

export class CodeGenerator {
  private backend: GeneratorBackend;

  constructor(backend: GeneratorBackend) {
    this.backend = backend;
  }

  generate(nodes: Node[], edges: Edge[], entryPoint?: string): string {
    console.log('='.repeat(60));
    console.log('ЭТАП 1: Graph → AST (построение дерева)');
    console.log('='.repeat(60));
    
    const ast = this.buildAST(nodes, edges, entryPoint);
    
    console.log('\n' + '='.repeat(60));
    console.log('ЭТАП 2: AST → Lua (сериализация)');
    console.log('='.repeat(60));
    
    const lua = generateLua(ast);
    
    console.log('\n--- ИТОГОВОЕ ДЕРЕВО AST ---');
    console.log(debugAST('Program', ast));
    
    console.log('\n--- СГЕНЕРИРОВАННЫЙ LUA ---');
    console.log(lua);
    console.log('='.repeat(60));
    
    return lua;
  }

  private buildAST(nodes: Node[], edges: Edge[], entryPoint?: string): LuaProgram {
    const generators = this.backend.getAll();
    
    // Если entryPoint передан - используем его, иначе ищем 'event_start'
    const startNodes = entryPoint
      ? nodes.filter(n => n.type === entryPoint)
      : nodes.filter(n => n.type === 'event_start');
    
    console.log('[AST] Стартовый тип:', entryPoint || 'event_start');
    console.log('[AST] Найдено стартовых узлов:', startNodes.length);

    if (startNodes.length === 0) {
      return program([]);
    }

    // Собираем тела функций с помощью flatMap
    const allStatements = startNodes.flatMap(startNode => {
      console.log('[AST] Обработка стартового узла:', startNode.type);
      
      const traverser = new ASTTraverser(nodes, edges, generators);
      return traverser.traverse(startNode.id, 'exec_out');
    });

    console.log('[AST] Всего statements:', allStatements.length);

    const func = funcDecl('onStart', [], allStatements);
    return program([func]);
  }
}
