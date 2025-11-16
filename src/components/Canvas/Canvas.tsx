import React, { useCallback, useEffect } from "react"
import { TestEntity, TestEntity1, TestEntity2, TestEntity3, useSpaceStore } from "@/stores/space-store"
import { useCanvasConfig } from "@/stores/canvas-store"
import { useCanvasDimensions } from "@/components/Canvas/use-canvas-dimensions"
import { useCanvasContext } from "@/components/Canvas/use-canvas-context"
import { useRenderer } from "@/components/Canvas/use-renderer"
import { createSpaceId } from "@/core/types/identifiers"
import { useCameraStore } from "@/stores/camera-store"
import useGestures from "@/hooks/use-gestures"
import { useToolsStore } from "@/stores/tools-store"
import { SelectionTool } from "@/tools/selection-tool"
import { SplineTool } from "@/tools/spline-tool"

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
  // eslint-disable-next-line local-rules/no-bare-use-memo-callback
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    TOOLS.forEach(tool => {
      tools.registerTool(tool)
    })
    tools.setCurrentTool("spline")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Subscribe to current tool state changes
  useEffect(() => {
    if (!tools.currentTool?.store) return

    const unsubscribe = tools.currentTool.store.subscribe(() => {
      performRender()
    })

    return unsubscribe
  }, [tools.currentTool, performRender])

  // Subscribe to tool changes to trigger re-render
  useEffect(() => {
    // Trigger a render when tool changes
    performRender()
  }, [tools.currentTool, performRender])

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
