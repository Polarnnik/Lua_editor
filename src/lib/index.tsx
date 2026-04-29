import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';
import { CodeBackend, NodeDefinition } from './types';
import { NodeRegistry } from './nodeRegistry';
import { CodeGenerator } from './generators/CodeGenerator';
import { luaBackend } from './backends/lua';
import { ContextMenu, ContextMenuState } from './components/ContextMenu';
import { ConnectionValidator } from './core/ConnectionValidator';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VisualEditorProps {
  /** Узлы доступные в редакторе. Снаружи: builtinNodes + кастомные. */
  nodes: NodeDefinition[];
  /** Языковой бэкенд. По умолчанию — luaBackend. */
  backend?: CodeBackend;
  /** Вызывается при каждом изменении графа со свежесгенерированным кодом. */
  onCodeChange?: (code: string) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

// ─── Внутренний компонент (внутри ReactFlowProvider) ─────────────────────────

function VisualEditorInner({
  nodes: nodeDefs,
  backend = luaBackend,
  onCodeChange,
  initialNodes: initNodes = [],
  initialEdges: initEdges = [],
}: VisualEditorProps) {
  const { screenToFlowPosition } = useReactFlow();

  const registry = useRef(new NodeRegistry());
  registry.current.init(nodeDefs);

  const validator = useRef(new ConnectionValidator(registry.current));
  // validator держит ссылку на registry — registry.current уже обновлён выше

  const nodeTypes = useMemo(
    () => registry.current.getReactFlowTypes(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeDefs],
  );

  const defaultInitialNodes: Node[] = initNodes.length > 0 ? initNodes : [
    {
      id: 'event_start-init',
      type: 'event_start',
      position: { x: 160, y: 160 },
      data: { label: 'Старт события' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [menu, setMenu] = useState<ContextMenuState>(null);

  // ── Кодогенерация — внутри редактора ─────────────────────────────────────
  // Вызывается при каждом изменении графа. Пользователь получает готовую строку.
  const generateCode = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      if (!onCodeChange) return;
      const generator = new CodeGenerator(registry.current, backend);
      onCodeChange(generator.generate(nextNodes, nextEdges));
    },
    [backend, onCodeChange],
  );

  // Генерируем сразу при монтировании если есть колбэк
  useEffect(() => {
    generateCode(nodes, edges);
    // только при монтировании
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Валидация перед созданием связи ──────────────────────────────────────
  const isValidConnection = useCallback(
    (connection: Connection) =>
      validator.current.isValid(connection, nodes, edges),
    [nodes, edges],
  );

  // ── Connections ───────────────────────────────────────────────────────────
  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const next = addEdge(
          { ...params, animated: Boolean(params.sourceHandle?.startsWith('exec')) },
          eds,
        );
        generateCode(nodes, next);
        return next;
      });
    },
    [setEdges, generateCode, nodes],
  );

  // ── Изменения нод и рёбер (перемещение, выделение и т.д.) ────────────────
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // nodes ещё не обновились в этом рендере — берём следующий тик
      setTimeout(() => generateCode(nodes, edges), 0);
    },
    [onNodesChange, generateCode, nodes, edges],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => generateCode(nodes, edges), 0);
    },
    [onEdgesChange, generateCode, nodes, edges],
  );

  // ── Добавление узла из контекстного меню ─────────────────────────────────
  const handleAddNode = useCallback(
    (type: string, flowPosition: { x: number; y: number }) => {
      const def = registry.current.get(type);
      if (!def) return;
      const newNode: Node = {
        id: `${type}-${nanoid(6)}`,
        type,
        position: flowPosition,
        data: { label: def.label, ...def.defaultData },
      };
      setNodes((nds) => {
        const next = nds.concat(newNode);
        generateCode(next, edges);
        return next;
      });
    },
    [setNodes, generateCode, edges],
  );

  // ── Удаление ──────────────────────────────────────────────────────────────
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
          generateCode(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
    },
    [setNodes, setEdges, generateCode],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.id !== edgeId);
        generateCode(nodes, next);
        return next;
      });
    },
    [setEdges, generateCode, nodes],
  );

  // ── Контекстное меню ──────────────────────────────────────────────────────
  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({ kind: 'canvas', x: e.clientX, y: e.clientY, flowX: flowPos.x, flowY: flowPos.y });
    },
    [screenToFlowPosition],
  );

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ kind: 'node', x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((e: React.MouseEvent, edge: Edge) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ kind: 'edge', x: e.clientX, y: e.clientY, edgeId: edge.id });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={closeMenu}
        onNodeClick={closeMenu}
        onEdgeClick={closeMenu}
        onMove={closeMenu}
        deleteKeyCode={['Backspace', 'Delete']}
        nodeTypes={nodeTypes}
        fitView
        colorMode="light"
      >
        <Background color="#e4e4e7" gap={16} />
        <Controls />
        <MiniMap nodeColor="#d4d4d8" maskColor="rgba(255,255,255,0.5)" />
      </ReactFlow>

      <ContextMenu
        menu={menu}
        categories={registry.current.getCategories()}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onClose={closeMenu}
      />
    </div>
  );
}

// ─── Публичный экспорт ────────────────────────────────────────────────────────

export default function VisualEditor(props: VisualEditorProps) {
  return (
    <ReactFlowProvider>
      <VisualEditorInner {...props} />
    </ReactFlowProvider>
  );
}
