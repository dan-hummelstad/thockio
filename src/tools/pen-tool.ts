import Stroke from "@/core/entities/stroke"
import Vec from "@/core/geom/vec"
import type { GestureHandlers } from "@/hooks/use-gestures"
import { useCameraStore } from "@/stores/camera-store"
import { useSpaceStore } from "@/stores/space-store"
import { Tool, type ToolState } from "@/tools/tools"
import { create } from "zustand"

export interface PenToolState extends ToolState {
  points: Vec[]
  isDrawing: boolean
  samplePoint: (point: Vec) => void
}

export class PenTool extends Tool<PenToolState> {
  readonly id = "pen"
  readonly name = "Pen Tool"
  readonly sample_interval = 2 // pixels

  constructor() {
    super()
  }

  createStore() {
    return create<PenToolState>(() => ({
      points: [],
      isDrawing: false,
      samplePoint: (point: Vec) => {
        this.store.setState((state) => ({
          points: [...state.points, point],
        }))
      },
    }))
  }

  onPointerDown: GestureHandlers["onMouseDown"] = (state) => {
    const cameraStore = useCameraStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    // Map pixels to space coordinates
    const spacePos = cameraStore.screenToSpace(pos)

    this.store.setState({ isDrawing: true, points: [spacePos] })
  }

  onPointerMove: GestureHandlers["onMouseMove"] = (state) => {
    const { isDrawing, points } = this.getState()
    if (!isDrawing) {
      return
    }

    const cameraStore = useCameraStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    // Map pixels to space coordinates
    const spacePos = cameraStore.screenToSpace(pos)

    // Sample point based on distance
    const lastPoint = points[points.length - 1]
    if (spacePos.distanceTo(lastPoint) >= this.sample_interval) {
      this.store.getState().samplePoint(spacePos)
    }
  }

  onPointerUp: GestureHandlers["onMouseUp"] = (state) => {
    const { isDrawing, points } = this.getState()
    if (!isDrawing) {
      return
    }

    const cameraStore = useCameraStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    // Map pixels to space coordinates
    const spacePos = cameraStore.screenToSpace(pos)

    const finalPoints = [...points, spacePos]

    const spaceStore = useSpaceStore.getState()
    const entity = new Stroke(null, finalPoints, 5, "#FFFFFF")
    spaceStore.addEntity(entity)

    this.reset()
  }

  render(ctx: CanvasRenderingContext2D) {
    const cameraStore = useCameraStore.getState()
    const { isDrawing, points } = this.getState()
    if (!isDrawing) {
      return
    }

    ctx.save()

    ctx.strokeStyle = "#3b82f6" // Blue color
    ctx.lineWidth = 2 / cameraStore.camera.zoom
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    ctx.restore()
  }

  reset() {
    this.store.setState({
      points: [],
      isDrawing: false,
    })
  }

  onActivate(): void {
    this.reset()
  }

  onDeactivate(): void {
    this.reset()
  }
}
