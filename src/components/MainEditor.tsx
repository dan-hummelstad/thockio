import { CanvasRenderer } from "./CanvasRenderer";
import ToolBar from "./ToolBar";

export default function MainEditor() {
  return (
    <div
      className="touch-none"
    >
      <CanvasRenderer />
      <ToolBar />
    </div>
  )
}