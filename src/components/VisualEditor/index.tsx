import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import './nodes/EventNode';
import './nodes/ActionNode';
import './nodes/ValueNode';
import './nodes/LogicNode';
import './nodes/MathNode';
import './nodes/CompareNode';
import { nodeRegistry } from './nodeRegistry';
import { CodeGenerator, luaBackend } from './generators';

const nodeTypes = nodeRegistry.getNodeTypes();

const initialNodes: Node[] = [
  { id: '1', type: 'event_start', position: { x: 100, y: 100 }, data: { label: 'Старт события' } },
];
const initialEdges: Edge[] = [];

export function VisualEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [generatedCode, setGeneratedCode] = useState('');
  const [menu, setMenu] = useState<{ id: string, type: 'node' | 'edge', top: number, left: number } | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: params.sourceHandle?.startsWith('exec') }, eds)),
    [setEdges],
  );

  const addNode = (type: string, label: string, extraData: Record<string, unknown> = {}) => {
    const nodeDef = nodeRegistry.get(type);
    const newNode: Node = {
      id: uuidv4(),
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label, ...nodeDef?.defaultData, ...extraData },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleGenerate = () => {
    const generator = new CodeGenerator(luaBackend);
    const code = generator.generate(nodes, edges);
    setGeneratedCode(code);
  };

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({ id: node.id, type: 'node', top: event.clientY, left: event.clientX });
    },
    [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setMenu({ id: edge.id, type: 'edge', top: event.clientY, left: event.clientX });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const deleteElement = useCallback(() => {
    if (!menu) return;
    if (menu.type === 'node') {
      setNodes((nds) => nds.filter((n) => n.id !== menu.id));
      setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    } else {
      setEdges((eds) => eds.filter((e) => e.id !== menu.id));
    }
    setMenu(null);
  }, [menu, setNodes, setEdges]);

  return (
    <div className="flex h-full w-full bg-zinc-50 text-zinc-900 font-sans">
      <div className="w-64 bg-white border-r border-zinc-200 p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-900">Узлы</h2>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">События</h3>
          <button onClick={() => addNode('event_start', 'Старт события')} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Старт события</button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Действия</h3>
          <button onClick={() => addNode('action_print', 'Печать (Print)')} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Печать (Print)</button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Значения</h3>
          <button onClick={() => addNode('value_string', 'Строка', { valueType: 'string' })} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Строка</button>
          <button onClick={() => addNode('value_number', 'Число', { valueType: 'number' })} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Число</button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Логика</h3>
          <button onClick={() => addNode('logic_if', 'Условие (If)')} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Условие (If)</button>
          <button onClick={() => addNode('logic_math', 'Математика')} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Математика</button>
          <button onClick={() => addNode('logic_compare', 'Сравнение')} className="bg-zinc-50 hover:bg-zinc-100 text-left px-3 py-2 rounded text-sm transition-colors border border-zinc-200 text-zinc-800">Сравнение</button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={onPaneClick}
          onNodeClick={onPaneClick}
          onEdgeClick={onPaneClick}
          deleteKeyCode={['Backspace', 'Delete']}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-50"
          colorMode="light"
        >
          <Background color="#e4e4e7" gap={16} />
          <Controls className="bg-white border-zinc-200 fill-zinc-700" />
          <MiniMap nodeColor="#d4d4d8" maskColor="rgba(255, 255, 255, 0.5)" className="bg-white" />
          
          <Panel position="top-right" className="flex gap-2">
            <button 
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium shadow-lg transition-colors"
            >
              Сгенерировать Lua
            </button>
          </Panel>
        </ReactFlow>
        
        {menu && (
          <div
            style={{ top: menu.top, left: menu.left }}
            className="fixed z-50 bg-white border border-zinc-200 rounded shadow-xl py-1 min-w-[120px]"
            onMouseLeave={() => setMenu(null)}
          >
            <button
              onClick={deleteElement}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Удалить {menu.type === 'node' ? 'узел' : 'связь'}
            </button>
          </div>
        )}
      </div>

      <div className="w-80 bg-white border-l border-zinc-200 flex flex-col">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Сгенерированный код</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <pre className="font-mono text-sm text-green-700 whitespace-pre-wrap">
            {generatedCode || '-- Нажмите "Сгенерировать Lua", чтобы увидеть код'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function VisualEditorWrapper() {
  return (
    <ReactFlowProvider>
      <VisualEditor />
    </ReactFlowProvider>
  );
}
