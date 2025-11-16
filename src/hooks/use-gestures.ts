import Vec from "@/core/geom/vec"
import { useCameraStore } from "@/stores/camera-store"
import { useToolsStore } from "@/stores/tools-store"
import {
  useGesture,
  type EventTypes,
  type NativeHandlers,
  type UserHandlers,
} from "@use-gesture/react"
import { useState } from "react"

export type GestureHandlers = Partial<NativeHandlers<EventTypes> & UserHandlers<EventTypes>>

export function useGestures(opts: {
  containerElement: React.RefObject<HTMLElement | null>
}) {
  const { containerElement } = opts
  const cameraStore = useCameraStore()
  const toolsStore = useToolsStore()
  const [isDragging, setDragging] = useState(false)
  const [startDragPos, setStartDragPos] = useState<Vec | null>(null)

  const gestureHandlers: GestureHandlers = {
    onMouseDown: (state) => {
      const activeTool = toolsStore.currentTool

      // Middle/right button for camera panning
      if (state.event.button !== 0) {
        setDragging(true)
        setStartDragPos(
          new Vec(state.event.screenX, state.event.screenY).subtract(
            cameraStore.camera.viewport.center()
          )
        )
        return
      }

      // Forward left click to active tool
      if (activeTool?.onPointerDown) {
        activeTool.onPointerDown(state)
      }
    },

    onMouseMove: (state) => {
      const activeTool = toolsStore.currentTool

      // Camera panning
      if (isDragging && startDragPos) {
        const pos = new Vec(
          state.event.screenX * window.devicePixelRatio - startDragPos.x,
          state.event.screenY * window.devicePixelRatio - startDragPos.y
        )
        cameraStore.updateCamera({
          viewport: cameraStore.camera.viewport.withCenter(pos),
        })
        return
      }

      // Forward to active tool
      if (activeTool?.onPointerMove) {
        activeTool.onPointerMove(state)
      }
    },

    onMouseUp: (state) => {
      const activeTool = toolsStore.currentTool

      // Camera panning end
      if (state.event.button !== 0) {
        setDragging(false)
        setStartDragPos(null)
        return
      }

      // Forward to active tool
      if (activeTool?.onPointerUp) {
        activeTool.onPointerUp(state)
      }
    },

    onWheel: (state) => {
      const dpi =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
      const mouseDevice = new Vec(
        state.event.clientX * dpi,
        state.event.clientY * dpi
      )

      const isPinchZoom = state.event.ctrlKey
      const hasHorizontalScroll = Math.abs(state.delta[0]) > 0
      const isTrackpadSwipe = !isPinchZoom && hasHorizontalScroll

      if (!isTrackpadSwipe) {
        // Zoom behavior
        const zoomDelta = state.delta[1] * 0.001
        if (Math.abs(zoomDelta) === 0) {
          return
        }
        cameraStore.zoomToPoint(mouseDevice, zoomDelta)
      } else {
        // Pan behavior
        const panDelta = new Vec(state.delta[0], state.delta[1])
        const currentCenter = cameraStore.camera.viewport.center()
        const newCenter = currentCenter.subtract(panDelta)

        cameraStore.updateCamera({
          viewport: cameraStore.camera.viewport.withCenter(newCenter),
        })
      }
    },
  }

  return useGesture(gestureHandlers, { target: containerElement })
}

export default useGestures