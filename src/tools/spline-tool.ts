import { create } from "zustand"
import { Tool, type ToolState } from "./tools"
import { useCameraStore } from "@/stores/camera-store"
import { useSpaceStore } from "@/stores/space-store"
import Vec from "@/core/geom/vec"
import type { GestureHandlers } from "@/hooks/use-gestures"
import Line from "@/core/entities/line"

export interface SplineToolState extends ToolState {
  startPoint: Vec | null
  currentPoint: Vec | null
  isDrawing: boolean
  setStartPoint: (point: Vec | null) => void
  setCurrentPoint: (point: Vec | null) => void
  setIsDrawing: (drawing: boolean) => void
  resetDraw: () => void
}

export class SplineTool extends Tool<SplineToolState> {
  readonly id = "spline"
  readonly name = "Spline Tool"

  constructor() {
    super()
  }

  createStore() {
    return create<SplineToolState>(() => ({
      startPoint: null,
      currentPoint: null,
      isDrawing: false,
      setStartPoint: (point) => {
        this.store.setState({ startPoint: point })
      },
      setCurrentPoint: (point) => {
        this.store.setState({ currentPoint: point })
      },
      setIsDrawing: (drawing) => {
        this.store.setState({ isDrawing: drawing })
      },
      resetDraw: () => {
        this.store.setState({
          startPoint: null,
          currentPoint: null,
          isDrawing: false,
        })
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

    this.store.setState({
      startPoint: spacePos,
      currentPoint: spacePos,
      isDrawing: true,
    })
  }

  onPointerMove: GestureHandlers["onMouseMove"] = (state) => {
    const { isDrawing } = this.getState()

    if (!isDrawing) {
      return
    }

    const cameraStore = useCameraStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    const spacePos = cameraStore.screenToSpace(pos)

    this.store.setState({
      currentPoint: spacePos,
    })
  }

  onPointerUp: GestureHandlers["onMouseUp"] = (_state) => {
    const { startPoint, currentPoint, isDrawing } = this.getState()

    if (!isDrawing || !startPoint || !currentPoint) {
      this.store.setState({ isDrawing: false })
      return
    }

    const spaceStore = useSpaceStore.getState()

    const entity = new Line(null, startPoint, currentPoint, 5, "#FFFFFF")
    spaceStore.addEntity(entity)

    // Reset the drawing state
    this.store.setState({
      startPoint: null,
      currentPoint: null,
      isDrawing: false,
    })
  }

  render(ctx: CanvasRenderingContext2D) {
    const cameraStore = useCameraStore.getState()
    const { startPoint, currentPoint, isDrawing } = this.getState()

    if (!isDrawing || !startPoint || !currentPoint) {
      return
    }

    // Draw the line being created
    ctx.save()
    ctx.strokeStyle = "#3b82f6" // Blue color
    ctx.lineWidth = 2 / cameraStore.camera.zoom
    ctx.setLineDash([5, 5]) // Dashed line for preview

    ctx.beginPath()
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()

    // Draw start point indicator
    ctx.fillStyle = "#3b82f6"
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(startPoint.x, startPoint.y, 4 / cameraStore.camera.zoom, 0, 2 * Math.PI)
    ctx.fill()

    // Draw current point indicator
    ctx.beginPath()
    ctx.arc(currentPoint.x, currentPoint.y, 4 / cameraStore.camera.zoom, 0, 2 * Math.PI)
    ctx.fill()

    ctx.restore()
  }

  reset() {
    this.store.setState({
      startPoint: null,
      currentPoint: null,
      isDrawing: false,
    })
  }

  onDeactivate(): void {
    // Clear any in-progress drawing when switching tools
    this.reset()
  }

  onActivate(): void {
    this.reset()
  }
}