import { create } from "zustand"
import { Tool, type ToolState } from "./tools"
import { useCameraStore } from "@/stores/camera-store"
import { useSpaceStore } from "@/stores/space-store"
import Vec from "@/core/geom/vec"
import type { GestureHandlers } from "@/hooks/use-gestures"
import type { EntityId } from "@/core/types/identifiers"

export interface SelectionToolState extends ToolState {
  selectedEntityIds: Set<EntityId>
  isDraggingEntity: boolean
  dragOffset: Vec | null
  setSelectedEntities: (ents: Set<EntityId>) => void
  addSelectedEntity: (ent: EntityId) => void
  removeSelectedEntity: (ent: EntityId) => void
  clearSelection: () => void
}

export class SelectionTool extends Tool<SelectionToolState> {
  readonly id = "selection"
  readonly name = "Selection Tool"

  constructor() {
    super()
  }

  createStore() {
    return create<SelectionToolState>(() => ({
      selectedEntityIds: new Set<EntityId>(),
      isDraggingEntity: false,
      dragOffset: null,
      setSelectedEntities: (ents) => {
        this.store.setState({ selectedEntityIds: ents })
      },
      addSelectedEntity: (ent) => {
        this.store.setState((state) => ({
          selectedEntityIds: new Set(state.selectedEntityIds).add(ent),
        }))
      },
      removeSelectedEntity: (ent) => {
        this.store.setState((state) => {
          const newSet = new Set(state.selectedEntityIds)
          newSet.delete(ent)
          return { selectedEntityIds: newSet }
        })
      },
      clearSelection: () => {
        this.store.setState({
          selectedEntityIds: new Set<EntityId>(),
          isDraggingEntity: false,
          dragOffset: null,
        })
      },
    }))
  }

  onPointerDown: GestureHandlers["onMouseDown"] = (state) => {
    const cameraStore = useCameraStore.getState()
    const spaceStore = useSpaceStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    // Map pixels to space coordinates
    const placePos = cameraStore.screenToSpace(pos)
    const entity = spaceStore.getEntityAtPosition(placePos)

    if (entity) {
      this.store.setState({
        selectedEntityIds: new Set([entity.id]),
        isDraggingEntity: true,
        dragOffset: placePos.subtract(entity.boundingBox.center()),
      })
    } else {
      this.store.setState({
        selectedEntityIds: new Set<EntityId>(),
        isDraggingEntity: false,
        dragOffset: null,
      })
    }
  }

  onPointerMove: GestureHandlers["onMouseMove"] = (state) => {
    const { selectedEntityIds, isDraggingEntity, dragOffset } = this.getState()
    
    if (!isDraggingEntity || selectedEntityIds.size === 0 || !dragOffset) {
      return
    }

    const cameraStore = useCameraStore.getState()
    const spaceStore = useSpaceStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    const clickPos = cameraStore.screenToSpace(pos)

    selectedEntityIds.forEach((id) => {
      spaceStore.bulkTransformEntity(() => {
        const entity = spaceStore.currentSpace?.entities.get(id)
        if (!entity || !entity.boundingBox) {
          return []
        }
        const placePos = clickPos
          .subtract(dragOffset)
          .subtract(entity.boundingBox.center())
        const movedEntity = entity.withPositionOffset(placePos)
        return [movedEntity]
      })
    })
  }

  onPointerUp: GestureHandlers["onMouseUp"] = (_state) => {
    this.store.setState({
      selectedEntityIds: new Set(),
      isDraggingEntity: false,
      dragOffset: null,
    })
  }

  render(ctx: CanvasRenderingContext2D) {
    const cameraStore = useCameraStore.getState()
    const spaceStore = useSpaceStore.getState()
    const { selectedEntityIds } = this.getState()

    selectedEntityIds.forEach((id) => {
      const entity = spaceStore.currentSpace?.entities.get(id)
      if (!entity || !entity.boundingBox) {
        return
      }
      const boxCorners: Vec[] = entity.boundingBox.inflate(5, 5).points
      
      // Draw selection outline
      ctx.save()
      ctx.strokeStyle = "red"
      ctx.lineWidth = 2 / cameraStore.camera.zoom
      ctx.setLineDash([10]);

      ctx.beginPath()
      boxCorners.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    })
  }

  reset(): void {
    this.store.setState({
      selectedEntityIds: new Set(),
      isDraggingEntity: false,
      dragOffset: null,
    })
  }

  onActivate(): void {
    this.reset()
  }

  onDeactivate(): void {
    this.reset()
  }
}