import React, { useCallback, useEffect } from "react"
import { TestEntity, TestEntity1, TestEntity2, TestEntity3, useSpaceStore } from "@/stores/SpaceStore"
import { useCanvasConfig } from "@/stores/CanvasStore"
import { useCanvasDimensions } from "@/components/Canvas/useCanvasDimensions"
import { useCanvasContext } from "@/components/Canvas/useCanvasContext"
import { useRenderer } from "@/components/Canvas/useRenderer"
import { createSpaceId } from "@/core/types/identifiers"
import { useCameraStore } from "@/stores/CameraStore"
import useGestures from "@/hooks/use-gestures"
import { useToolsStore } from "@/stores/ToolsStore"
import { SelectionTool } from "@/tools/SelectionTool"
import { SplineTool } from "@/tools/SplineTool"

interface CanvasProps {
  aspectRatio?: number
  containerRef?: React.RefObject<HTMLDivElement>
}

const TOOLS = [
  new SelectionTool(),
  new SplineTool()
] as const

// Probably refactor all these stores into a greater context hook of some sort

export default function Canvas({ aspectRatio, containerRef }: CanvasProps) {
  const space = useSpaceStore()
  const camera = useCameraStore()
  const tools = useToolsStore()
  const { backgroundColor } = useCanvasConfig()

  // Provide refs / state for the container and dimensions
  const {
    containerElement,
    internalContainerRef,
    dimensions,
    isInitialized
  } = useCanvasDimensions({ aspectRatio, containerRef })

  // Provide canvas and context refs + initialization logic
  const { canvasRef, contextRef } = useCanvasContext({
    dimensions,
    isInitialized,
    backgroundColor,
    camera
  })

  // Create stable performRender callback
  const performRender = useRenderer({
    contextRef,
    canvasRef,
    dimensions,
    backgroundColor,
    space: space.currentSpace,
    camera,
    tools
  })

  useGestures({ containerElement })

  // Change to custom context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    TOOLS.forEach(tool => {
      tools.registerTool(tool)
    })
    tools.setCurrentTool("spline")
  }, [])

  // tool re-render isnt happening immediately after tool state changes or something
  tools.currentTool?.store.subscribe(() => {
    const frame = requestAnimationFrame(() => performRender())
    return () => cancelAnimationFrame(frame)
  })

  // Populate test entities once (kept here for compatibility)
  useEffect(() => {
    if (!space.currentSpace) {
      space.createSpace(createSpaceId())
      space.addEntity(TestEntity())
      space.addEntity(TestEntity1())
      space.addEntity(TestEntity2())
      space.addEntity(TestEntity3())
      // schedule initial render to avoid synchronous update loops
      
    }
    const frame = requestAnimationFrame(() => performRender())
    return () => cancelAnimationFrame(frame)
  }, [space, tools, performRender])

  if (!isInitialized) {
    return (
      <div
        ref={internalContainerRef}
        className="w-full h-full relative"
        style={{ width: "100%", height: "100%", minHeight: "100vh" }}
      />
    )
  }

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "100vh",
    backgroundColor: aspectRatio ? "transparent" : (backgroundColor || undefined)
  }

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    display: "block"
  }

  return (
    <div ref={containerElement} className="w-full h-full relative touch-none" style={containerStyle}>
      <canvas
        className="touch-none"
        ref={canvasRef}
        style={canvasStyle}
        onContextMenu={handleContextMenu}
        width={camera.camera.viewport.width}
        height={camera.camera.viewport.height}
      />
    </div>
  )
}
