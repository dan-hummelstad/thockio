import { MousePointer2Icon, SplineIcon } from "lucide-react"
import { Toggle } from "./ui/toggle"
import { useToolsStore } from "@/stores/tools-store"

export default function ToolBar () {
  const { currentTool, setCurrentTool } = useToolsStore()

  return (
    <div
      className="absolute bg-white bottom-8 left-1/2 transform -translate-x-1/2 border-2 flex items-center px-4 rounded-md"
    >
      <div className="grid grid-cols-3 gap-4 w-full">
        <Toggle
          pressed={currentTool?.id === 'selection'}
          onPressedChange={(pressed) => setCurrentTool(pressed ? "selection" : null)}
          variant="outline"
          className="data-[state=on]:bg-green-300 data-[state=on]:text-accent-foreground"
        >
          <MousePointer2Icon />
        </Toggle>
        <Toggle
          pressed={currentTool?.id === "spline"}
          onPressedChange={(pressed) => setCurrentTool(pressed ? "spline" : null)}
          variant="outline"
          className="data-[state=on]:bg-green-300 data-[state=on]:text-accent-foreground"
        >
          <SplineIcon />
        </Toggle>
      </div>
    </div>
  )
}
