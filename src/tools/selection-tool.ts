import { create } from "zustand"
import { Tool, type ToolState } from "./tools"
import { useCameraStore } from "@/stores/camera-store"
import { useSpaceStore } from "@/stores/space-store"
import Vec from "@/core/geom/vec"
import type { GestureHandlers } from "@/hooks/use-gestures"
import type { EntityId } from "@/core/types/identifiers"
import Rect from "@/core/geom/rect"
import type { Entities } from "@/core/entities/entity-base"

export interface SelectionToolState extends ToolState {
  selectedEntityIds: Set<EntityId>
  isDraggingEntity: boolean
  dragOffset: Vec | null
  clickPos: Vec | null
  dragPos: Vec | null
  initialDragPos: Vec | null
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
      clickPos: null,
      dragPos: null,
      initialDragPos: null,
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
          initialDragPos: null, // Add this
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
      let entities = this.getState().selectedEntityIds
      if (state.event.shiftKey) {
        // Toggle selection
        if (entities.has(entity.id)) {
          entities = new Set(entities)
          entities.delete(entity.id)
        } else {
          entities = new Set(entities).add(entity.id)
        }
      } else if (!entities.has(entity.id)) {
        entities = new Set([entity.id])
      }
      this.store.setState({
        selectedEntityIds: entities,
        isDraggingEntity: true,
        dragOffset: placePos.subtract(entity.boundingBox.center()),
        clickPos: null,
        initialDragPos: placePos, // Store initial drag position
      })
    } else {
      this.store.setState({
        selectedEntityIds: new Set<EntityId>(),
        isDraggingEntity: false,
        dragOffset: null,
        clickPos: placePos,
        dragPos: placePos,
      })
    }
  }

  onPointerMove: GestureHandlers["onMouseMove"] = (state) => {
    const { selectedEntityIds, isDraggingEntity, initialDragPos } = this.getState()

    const cameraStore = useCameraStore.getState()
    const spaceStore = useSpaceStore.getState()

    const pos = new Vec(
      state.event.clientX * window.devicePixelRatio,
      state.event.clientY * window.devicePixelRatio
    )

    const currentPos = cameraStore.screenToSpace(pos)

    if (!isDraggingEntity) {
      this.setState({ dragPos: currentPos })
    } else {
      if (selectedEntityIds.size === 0 || !initialDragPos) {
        return
      }
      
      const movementDelta = currentPos.subtract(initialDragPos)
      
      spaceStore.bulkTransformEntity(() => {
        const movedEntities: Entities[] = []
        selectedEntityIds.forEach((id) => {
          const entity = spaceStore.currentSpace?.entities.get(id)
          if (!entity) {
            return
          }
          const movedEntity = entity.withPositionOffset(movementDelta)
          movedEntities.push(movedEntity)
        })
        return movedEntities
      })
      
      this.store.setState({ initialDragPos: currentPos })
    }
  }

  onPointerUp: GestureHandlers["onMouseUp"] = (_state) => {
    const { isDraggingEntity, clickPos, dragPos } = this.getState()
    let foundEntityIds: Set<EntityId> | null = null
    let isDragging = false
    if (!isDraggingEntity && clickPos && dragPos) {
      const spaceStore = useSpaceStore.getState()
      const cameraStore = useCameraStore.getState()
      const selectionRect = Rect.fromPoints(cameraStore.screenToSpace(clickPos), cameraStore.screenToSpace(dragPos))
      const foundEntities = spaceStore.getEntitiesInRect(selectionRect)
      foundEntityIds = new Set<EntityId>(new Array(...foundEntities).map((e) => e.id))
      isDragging = foundEntityIds.size > 0
    }
    this.store.setState({
      selectedEntityIds: foundEntityIds ?? this.getState().selectedEntityIds,
      isDraggingEntity: isDragging,
      dragOffset: null,
      clickPos: null,
      dragPos: null,
      initialDragPos: null,
    })
  }

  render(ctx: CanvasRenderingContext2D) {
    const cameraStore = useCameraStore.getState()
    const spaceStore = useSpaceStore.getState()
    const { selectedEntityIds, isDraggingEntity } = this.getState()
    // Render selection outlines
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
      ctx.setLineDash([10])

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

    // Render selection rectangle if not dragging an entity
    if (!isDraggingEntity) {
      const { clickPos, dragPos } = this.getState()
      if (clickPos && dragPos) {
        // Draw selection rectangle
        const rect = Rect.fromPoints(clickPos, dragPos).inflate(5, 5)

        ctx.save()
        ctx.strokeStyle = "red"
        ctx.lineWidth = 2 / cameraStore.camera.zoom
        ctx.setLineDash([10])

        ctx.beginPath()
        const points = rect.points
        points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  reset(): void {
    this.store.setState({
      selectedEntityIds: new Set(),
      isDraggingEntity: false,
      dragOffset: null,
      initialDragPos: null,
    })
  }

  onActivate(): void {
    this.reset()
  }

  onDeactivate(): void {
    this.reset()
  }
}
