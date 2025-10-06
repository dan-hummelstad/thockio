import Line from "@/core/entities/Line"
import Vec from "@/core/geom/Vec"
import { useCameraStore } from "@/stores/CameraStore"
import { useSpaceStore } from "@/stores/SpaceStore"
import { useGesture, type EventTypes, type NativeHandlers, type UserHandlers } from "@use-gesture/react"
import { useState } from "react"

export function useGestures(opts: {
  containerElement: React.RefObject<HTMLElement | null>
}) {
  const { containerElement } = opts
  const camera = useCameraStore()
  const space = useSpaceStore()
  const [isDragging, setDragging] = useState(false)
  const [startDragPos, setStartDragPos] = useState<Vec | null>(null)
  // Wire up pointer gestures to camera (useMemo to keep handlers stable)
  const gestureHandlers: Partial<NativeHandlers<EventTypes> & UserHandlers<EventTypes>> = {
    onMouseDown: (state) => {
      if (isDragging) return
      if (state.event.button !== 0) {
        setDragging(true)
        setStartDragPos(new Vec(state.event.screenX, state.event.screenY).subtract(camera.camera.viewport.center()))
      } else {
        const scaledX = state.event.clientX * window.devicePixelRatio
        const scaledY = state.event.clientY * window.devicePixelRatio
        // map pixels to space coordinates
        const placePos = camera.screenToSpace(scaledX, scaledY)
        space.addEntity(new Line(new Vec(placePos.x, placePos.y), new Vec(placePos.x + 5, placePos.y + 5), 10, "#FFFFFF"))
        // schedule render next frame to avoid sync update chains
        // requestAnimationFrame(() => performRender())
        
      }
    },
    onMouseMove: (state) => {
      if (!isDragging || !startDragPos) {
        return
      }
      const pos = new Vec(
        state.event.screenX * window.devicePixelRatio - startDragPos.x,
        state.event.screenY * window.devicePixelRatio - startDragPos.y
      )
      camera.updateCamera({
        viewport: camera.camera.viewport.withCenter(pos)
      })
    },
    onMouseUp: (state) => {
      if (state.event.button !== 0) {
        setDragging(false)
        setStartDragPos(null)
      }
    },
    onWheel: (state) => {
      const dpi = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1
      const mouseDevice = new Vec(state.event.clientX * dpi, state.event.clientY * dpi)

      // Check if this is a pinch-zoom gesture (ctrlKey is set on trackpad pinch)
      const isPinchZoom = state.event.ctrlKey
      
      // Check if there's significant horizontal movement (indicates trackpad swipe)
      const hasHorizontalScroll = Math.abs(state.delta[0]) > 0
      const isTrackpadSwipe = !isPinchZoom && hasHorizontalScroll

      if (!isTrackpadSwipe) {
        // Zoom behavior (mouse wheel or trackpad pinch)
        const zoomDelta = state.delta[1] * 0.001
        if (Math.abs(zoomDelta) === 0) {
          return
        }
        camera.zoomToPoint(mouseDevice, zoomDelta)
      } else {
        // Pan behavior (trackpad two-finger swipe)
        const panDelta = new Vec(state.delta[0], state.delta[1])
        const currentCenter = camera.camera.viewport.center()
        const newCenter = currentCenter.subtract(panDelta)
        
        camera.updateCamera({
          viewport: camera.camera.viewport.withCenter(newCenter)
        })
      }
    },
  }

  return useGesture(gestureHandlers, { target: containerElement })
}

export default useGestures