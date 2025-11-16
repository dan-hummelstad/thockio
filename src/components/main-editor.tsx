import { CanvasRenderer } from "./canvas-renderer"
import ToolBar from "./tool-bar"
import { DebugOverlay } from "./debug/debug-overlay"

export default function MainEditor() {
  return (
    <div
      className="touch-none"
    >
      <CanvasRenderer />
      <ToolBar />
      <DebugOverlay />
    </div>
  )
}
