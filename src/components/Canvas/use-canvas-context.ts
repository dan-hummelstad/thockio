import { useEffect, useRef } from "react"
import { type CameraState } from "@/stores/camera-store"
import Rect from "@/core/geom/rect"

export function useCanvasContext(opts: {
  dimensions: { width: number; height: number }
  isInitialized: boolean
  backgroundColor?: string | null
  camera: CameraState
}) {
  const { dimensions, isInitialized, backgroundColor, camera } = opts
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize canvas context when dimensions are available
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0 || !isInitialized) return

    const context = canvas.getContext("2d")
    if (!context) {
      console.error("Failed to get 2D context")
      return
    }
    contextRef.current = context

    const dpi = window.devicePixelRatio || 1
    const width = Math.max(1, dimensions.width * dpi)
    const height = Math.max(1, dimensions.height * dpi)
    
    if (canvas.width !== width || canvas.height !== height) {
      // if 0,0 is the centre of the viewport, what is the top left?
      camera.setCamera({ ...camera.camera, zoom: 1, viewport: Rect.fromXYWH(-width / 2, -height / 2, width, height) })
      canvas.style.width = `${dimensions.width}px`
      canvas.style.height = `${dimensions.height}px`
      canvas.width = width
      canvas.height = height

      if (backgroundColor) {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, width, height)
      }
    }

    return () => {
      contextRef.current = null
    }
  }, [dimensions, isInitialized, backgroundColor, camera])

  // Update canvas size when dimensions change (without re-getting context)
  useEffect(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || dimensions.width === 0 || dimensions.height === 0) return

    const dpi = window.devicePixelRatio || 1
    const width = Math.max(1, dimensions.width * dpi)
    const height = Math.max(1, dimensions.height * dpi)

    if (canvas.width !== width || canvas.height !== height) {
      camera.setCamera({ ...camera.camera, viewport: Rect.fromXYWH(-width / 2, -height / 2, width, height) })
      canvas.style.width = `${dimensions.width}px`
      canvas.style.height = `${dimensions.height}px`
      canvas.width = width
      canvas.height = height

      if (backgroundColor) {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, width, height)
      }
    }
  }, [dimensions, backgroundColor, camera])

  return {
    canvasRef,
    contextRef
  }
}
