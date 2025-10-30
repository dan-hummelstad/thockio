import { CanvasRenderer } from "./CanvasRenderer";
import ToolBar from "./ToolBar";
import { DebugOverlay } from "./debug/DebugOverlay";

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