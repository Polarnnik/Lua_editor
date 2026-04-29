import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
  OnConnectEnd,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";
import {
  CodeBackend,
  NodeDefinition,
  EditorTheme,
  defaultTheme,
  PinType,
} from "./types";
import { NodeRegistry } from "./nodeRegistry";
import { CodeGenerator } from "./generators/CodeGenerator";
import { luaBackend } from "./backends/lua";
import { ContextMenu, ContextMenuState } from "./components/ContextMenu";
import { ConnectionValidator } from "./core/ConnectionValidator";
import { ThemeProvider } from "./core/ThemeContext";
import { GraphStore } from "./core/GraphStore";

export interface VisualEditorHandle {
  generate(): string;
  getGraph(): { nodes: Node[]; edges: Edge[] };
  loadGraph(snap: { nodes: Node[]; edges: Edge[] }): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

export interface VisualEditorProps {
  nodes: NodeDefinition[];
  backend?: CodeBackend;
  theme?: Partial<EditorTheme>;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

interface InnerProps extends VisualEditorProps {
  editorRef: React.Ref<VisualEditorHandle>;
}

function VisualEditorInner({
  nodes: nodeDefs,
  backend = luaBackend,
  theme: themeProp,
  initialNodes: initNodes = [],
  initialEdges: initEdges = [],
  editorRef,
}: InnerProps) {
  const theme: EditorTheme = {
    ...defaultTheme,
    ...themeProp,
    pinColors: { ...defaultTheme.pinColors, ...themeProp?.pinColors },
  };
  const { screenToFlowPosition } = useReactFlow();

  const registry = useMemo(() => {
    const r = new NodeRegistry();
    r.init(nodeDefs);
    return r;
  }, [nodeDefs]);

  const validator = useRef(new ConnectionValidator(registry));
  useEffect(() => {
    validator.current = new ConnectionValidator(registry);
  }, [registry]);

  const nodeTypes = useMemo(() => registry.getReactFlowTypes(), [registry]);

  const defaultInitialNodes: Node[] =
    initNodes.length > 0
      ? initNodes
      : [
          {
            id: "event_start-init",
            type: "event_start",
            position: { x: 160, y: 160 },
            data: { label: "Старт события" },
          },
        ];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [menu, setMenu] = useState<ContextMenuState>(null);

  const clipboard = useRef<Node[]>([]);
  const [hasClipboard, setHasClipboard] = useState(false);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const store = useRef<GraphStore | null>(null);
  if (!store.current) {
    store.current = new GraphStore(
      { nodes: defaultInitialNodes, edges: initEdges },
      (snap) => {
        setNodes(snap.nodes);
        setEdges(snap.edges);
      },
    );
  }

  const pushSnapshot = useCallback((nextNodes: Node[], nextEdges: Edge[]) => {
    store.current!.push({ nodes: nextNodes, edges: nextEdges });
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.current!.undo();
        return;
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        store.current!.redo();
        return;
      }
      if (e.key === "d") {
        e.preventDefault();
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;
        const selected = currentNodes.filter((n) => n.selected);
        if (!selected.length) return;
        const duped = selected.map((n) => ({
          ...n,
          id: `${n.type}-${nanoid(6)}`,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: false,
        }));
        const next = currentNodes
          .map((n) => ({ ...n, selected: false }))
          .concat(duped);
        setNodes(next);
        pushSnapshot(next, currentEdges);
        return;
      }
      if (e.key === "c") {
        e.preventDefault();
        const selected = nodesRef.current.filter((n) => n.selected);
        if (!selected.length) return;
        clipboard.current = selected;
        setHasClipboard(true);
        return;
      }
      if (e.key === "v") {
        e.preventDefault();
        if (!clipboard.current.length) return;
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;
        const pasted = clipboard.current.map((n) => ({
          ...n,
          id: `${n.type}-${nanoid(6)}`,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: false,
        }));
        const next = currentNodes
          .map((n) => ({ ...n, selected: false }))
          .concat(pasted);
        setNodes(next);
        pushSnapshot(next, currentEdges);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  useImperativeHandle(
    editorRef,
    () => ({
      generate() {
        return new CodeGenerator(registry, backend).generate(
          nodesRef.current,
          edgesRef.current,
        );
      },
      getGraph() {
        return { nodes: nodesRef.current, edges: edgesRef.current };
      },
      loadGraph(snap) {
        store.current!.load(snap);
      },
      undo() {
        store.current!.undo();
      },
      redo() {
        store.current!.redo();
      },
      canUndo() {
        return store.current!.canUndo();
      },
      canRedo() {
        return store.current!.canRedo();
      },
    }),
    [registry, backend],
  );

  const isValidConnection = useCallback(
    (connection: Connection) =>
      validator.current.isValid(connection, nodesRef.current, edgesRef.current),
    [],
  );

  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const next = addEdge(
          {
            ...params,
            animated: Boolean(params.sourceHandle?.startsWith("exec")),
          },
          eds,
        );
        pushSnapshot(nodesRef.current, next);
        return next;
      });
    },
    [setEdges, pushSnapshot],
  );

  const pendingConnection = useRef<{
    sourceNodeId: string;
    sourceHandle: string;
  } | null>(null);

  const onConnectStart = useCallback(
    (
      _: unknown,
      params: { nodeId: string | null; handleId: string | null },
    ) => {
      if (params.nodeId && params.handleId) {
        pendingConnection.current = {
          sourceNodeId: params.nodeId,
          sourceHandle: params.handleId,
        };
      }
    },
    [],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const pending = pendingConnection.current;
      pendingConnection.current = null;

      const target = event.target as HTMLElement;
      if (target.closest(".react-flow__handle")) return;
      if (!pending) return;

      const sourceNode = nodesRef.current.find(
        (n) => n.id === pending.sourceNodeId,
      );
      if (!sourceNode) return;

      const def = registry.get(sourceNode.type ?? "");
      if (!def) return;

      const sourcePin = def.outputs?.find((p) => p.id === pending.sourceHandle);
      const pinType = sourcePin?.type as PinType | undefined;

      const clientEvent = event as MouseEvent;
      const flowPos = screenToFlowPosition({
        x: clientEvent.clientX,
        y: clientEvent.clientY,
      });

      setMenu({
        kind: "canvas",
        x: clientEvent.clientX,
        y: clientEvent.clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
        pinFilter: pinType,
      });
    },
    [registry, screenToFlowPosition],
  );

  const handleAddNode = useCallback(
    (type: string, flowPosition: { x: number; y: number }) => {
      const def = registry.get(type);
      if (!def) return;
      const newNode: Node = {
        id: `${type}-${nanoid(6)}`,
        type,
        position: flowPosition,
        data: { label: def.label, ...def.defaultData },
      };
      setNodes((nds) => {
        const next = nds.concat(newNode);
        pushSnapshot(next, edgesRef.current);
        return next;
      });
    },
    [registry, setNodes, pushSnapshot],
  );

  const handleCopyNode = useCallback((nodeId: string) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node) return;
    clipboard.current = [node];
    setHasClipboard(true);
  }, []);

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node) return;
      const duped: Node = {
        ...node,
        id: `${node.type}-${nanoid(6)}`,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: false,
      };
      setNodes((nds) => {
        const next = nds.concat(duped);
        pushSnapshot(next, edgesRef.current);
        return next;
      });
    },
    [setNodes, pushSnapshot],
  );

  const handlePaste = useCallback(
    (position: { x: number; y: number }) => {
      if (!clipboard.current.length) return;
      const nodes = clipboard.current;
      const cx = nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length;
      const cy = nodes.reduce((s, n) => s + n.position.y, 0) / nodes.length;
      const pasted = nodes.map((n) => ({
        ...n,
        id: `${n.type}-${nanoid(6)}`,
        position: {
          x: position.x + (n.position.x - cx),
          y: position.y + (n.position.y - cy),
        },
        selected: false,
      }));
      setNodes((nds) => {
        const next = nds.concat(pasted);
        pushSnapshot(next, edgesRef.current);
        return next;
      });
    },
    [setNodes, pushSnapshot],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const nextEdges = eds.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          );
          pushSnapshot(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
    },
    [setNodes, setEdges, pushSnapshot],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.id !== edgeId);
        pushSnapshot(nodesRef.current, next);
        return next;
      });
    },
    [setEdges, pushSnapshot],
  );

  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({
        kind: "canvas",
        x: e.clientX,
        y: e.clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ kind: "node", x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((e: React.MouseEvent, edge: Edge) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ kind: "edge", x: e.clientX, y: e.clientY, edgeId: edge.id });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  return (
    <ThemeProvider theme={theme}>
      <div className="relative h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          isValidConnection={isValidConnection}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={closeMenu}
          onNodeClick={closeMenu}
          onEdgeClick={closeMenu}
          onMove={closeMenu}
          deleteKeyCode={["Backspace", "Delete"]}
          selectionOnDrag
          selectionMode={"partial" as never}
          multiSelectionKeyCode="Shift"
          nodeTypes={nodeTypes}
          fitView
          colorMode="light"
          style={{ background: theme.canvasBackground }}
        >
          <Background color={theme.canvasGrid} gap={16} />
          <Controls />
          <MiniMap nodeColor="#d4d4d8" maskColor="rgba(255,255,255,0.5)" />
        </ReactFlow>

        <ContextMenu
          menu={menu}
          categories={registry.getCategories()}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onDuplicateNode={handleDuplicateNode}
          onCopyNode={handleCopyNode}
          onPaste={handlePaste}
          hasClipboard={hasClipboard}
          onClose={closeMenu}
        />
      </div>
    </ThemeProvider>
  );
}

const VisualEditor = forwardRef<VisualEditorHandle, VisualEditorProps>(
  (props, ref) => (
    <ReactFlowProvider>
      <VisualEditorInner {...props} editorRef={ref} />
    </ReactFlowProvider>
  ),
);

VisualEditor.displayName = "VisualEditor";
export default VisualEditor;
