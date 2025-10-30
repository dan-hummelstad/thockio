import { useCallback } from "react"
import type { RendererFactory } from "../renderers/Renderer"
import { LayersToRenderersMap, useCanvasState } from "@/stores/CanvasStore"
import type { Space } from "@/stores/SpaceStore"
import type { CameraState } from "@/stores/CameraStore"
import type { ToolsState } from "@/stores/ToolsStore"

export function useRenderer(opts: {
  contextRef: React.RefObject<CanvasRenderingContext2D | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  dimensions: { width: number; height: number }
  backgroundColor?: string | null
  space: Space | null
  camera: CameraState
  tools: ToolsState
}) {
  const { contextRef, canvasRef, dimensions, backgroundColor, space, camera, tools } = opts
  const canvasState = useCanvasState()

  const performRender = useCallback(() => {
    const context = contextRef.current
    const canvas = canvasRef.current

    if (!context || !canvas || canvasState.activeLayerNames.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      return
    }

    const pixelDimensions = {
      width: dimensions.width * (window.devicePixelRatio || 1),
      height: dimensions.height * (window.devicePixelRatio || 1)
    }

    // Clear canvas with background color or clearRect
    if (backgroundColor) {
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, pixelDimensions.width, pixelDimensions.height)
    } else {
      context.clearRect(0, 0, pixelDimensions.width, pixelDimensions.height)
    }

    // Translate/transform according to camera if needed
    try {
      context.save()
      const viewportCentre = camera.camera.viewport.center()
      context.translate(viewportCentre.x, viewportCentre.y)
      context.scale(camera.camera.zoom, camera.camera.zoom)

    } catch (e) {
      // ignore transform errors
    }

    // Collect and run renderers
    const sortedRenderers: RendererFactory[] = LayersToRenderersMap
      .filter(l => canvasState.activeLayerNames.includes(l.name))
      .flatMap(l => l.renderers)

    sortedRenderers.forEach((renderer: RendererFactory) => {
      try {
        const currentRenderer = renderer()
        if (currentRenderer.shouldRender(context)) {
          currentRenderer.render(context, {
            entities: Array.from(space?.entities.values() ?? []),
            canvasDimensions: dimensions
          })
        }
      } catch (error) {
        console.warn(`Renderer "${renderer.name}" failed to render:`, error)
      }
    })

    // Render tool overlays
    tools.currentTool?.render?.(context)

    try {
      context.restore()
    } catch (e) {
      console.warn(e)
    }

    // NEW: mark a frame so lastRenderTime updates (DebugOverlay FPS)
    // canvasState._internalRender()
  }, [
    contextRef,
    canvasRef,
    dimensions,
    backgroundColor,
    space,
    canvasState.activeLayerNames,
    canvasState._internalRender, // added
    camera.camera
  ])

  return performRender
}
