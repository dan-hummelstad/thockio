import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useCanvasStore } from "@/stores/CanvasStore"
import { useToolsStore } from "@/stores/ToolsStore"

export interface DebugContext {
  fps: number
  frameCount: number
  mouse: { x: number; y: number }
  tool: {
    id: string | null
    name: string | null
    state: unknown
  }
  registerPanel: (panel: DebugPanel) => void
}

export interface DebugPanel {
  id: string
  title?: string
  order?: number
  render: (ctx: DebugContext) => React.ReactNode
}

interface DebugOverlayProps {
  panels?: DebugPanel[]
  className?: string
  style?: React.CSSProperties
}

function sanitize(value: any, seen = new WeakSet()): any {
  if (value == null) return value
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") return value
  if (typeof value === "function") return "[Function]"
  if (typeof value === "symbol") return value.toString()
  if (seen.has(value)) return "[Circular]"
  if (value instanceof Set) return { __type: "Set", values: Array.from(value.values()).map(v => sanitize(v, seen)) }
  if (value instanceof Map) return { __type: "Map", entries: Array.from(value.entries()).map(([k, v]) => [sanitize(k, seen), sanitize(v, seen)]) }
  if (value.x !== undefined && value.y !== undefined && Object.keys(value).length <= 3) {
    return { x: value.x, y: value.y }
  }
  if (typeof value === "object") {
    seen.add(value)
    const out: Record<string, any> = {}
    Object.keys(value).forEach(k => {
      try {
        out[k] = sanitize(value[k], seen)
      } catch {
        out[k] = "[Unserializable]"
      }
    })
    return out
  }
  return value
}

const defaultPanels: DebugPanel[] = [
  {
    id: "fps",
    title: "Performance",
    order: 0,
    render: ({ fps, frameCount }) => (
      <div className="space-y-0.5">
        <div><span className="font-medium">FPS:</span> {fps.toFixed(0)}</div>
        <div><span className="font-medium">Frames:</span> {frameCount}</div>
      </div>
    )
  },
  {
    id: "mouse",
    title: "Mouse",
    order: 1,
    render: ({ mouse }) => (
      <div>
        <span className="font-medium">Pos:</span> {mouse.x.toFixed(1)}, {mouse.y.toFixed(1)}
      </div>
    )
  },
  {
    id: "tool",
    title: "Tool",
    order: 2,
    render: ({ tool }) => (
      <div className="space-y-0.5">
        <div><span className="font-medium">Active:</span> {tool.id || "none"}</div>
        {tool.state != null && (
          <pre className="text-[10px] leading-tight max-h-40 overflow-auto bg-black/30 p-1 rounded">
            {JSON.stringify(sanitize(tool.state), null, 2)}
          </pre>
        )}
      </div>
    )
  }
]

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ panels = [], className, style }) => {
  const lastRenderTime = useCanvasStore(s => s.lastRenderTime)
  const tools = useToolsStore()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [dynamicPanels, setDynamicPanels] = useState<DebugPanel[]>(() => [...defaultPanels, ...panels])
  const frameTimesRef = useRef<number[]>([])
  const frameCountRef = useRef(0)
  const [, forceRerender] = useState(0)

  // Mouse tracking
  useEffect(() => {
    const move = (e: PointerEvent | MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [])

  // FPS calculation
  useEffect(() => {
    if (!lastRenderTime) return
    const now = performance.now()
    frameTimesRef.current.push(now)
    frameCountRef.current++
    // keep last 1000ms
    while (frameTimesRef.current.length && now - frameTimesRef.current[0] > 1000) {
      frameTimesRef.current.shift()
    }
    // trigger re-render (throttled by render updates anyway)
    forceRerender(x => x + 1)
  }, [lastRenderTime])

  const fps = frameTimesRef.current.length
  const toolState = tools.currentTool ? tools.currentTool.getState() : null

  const registerPanel = useCallback((panel: DebugPanel) => {
    setDynamicPanels(prev => {
      if (prev.find(p => p.id === panel.id)) {
        return prev.map(p => (p.id === panel.id ? panel : p))
      }
            return [...prev, panel]
    })
  }, [])

  const context: DebugContext = useMemo(() => ({
    fps,
    frameCount: frameCountRef.current,
    mouse,
    tool: {
      id: tools.currentTool?.id ?? null,
      name: tools.currentTool?.name ?? null,
      state: toolState
    },
    registerPanel
  }), [fps, mouse, toolState, tools.currentTool, registerPanel])

  const orderedPanels: DebugPanel[] = useMemo(
    () => [...dynamicPanels].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [dynamicPanels]
  )

  return (
    <div
      className={["fixed top-2 right-2 z-50 w-72 pointer-events-none font-mono text-[11px] text-white select-none", className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className="space-y-2">
        {orderedPanels.map((panel: DebugPanel) => (
          <div
            key={panel.id}
            className="pointer-events-auto bg-black/60 backdrop-blur-sm rounded-md border border-white/10 px-3 py-2 shadow-md"
          >
            {panel.title && <div className="text-[10px] uppercase tracking-wide mb-1 opacity-70">{panel.title}</div>}
            {panel.render(context) as React.ReactNode /* cast fixes TS 'unknown' issue */}
          </div>
        ))}
      </div>
    </div>
  )
}
