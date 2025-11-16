import type { Entities } from "@/core/entities/entity-base"
import type EntityBase from "@/core/entities/entity-base"
import Line from "@/core/entities/line"
import Vec from "@/core/geom/vec"
import type { EntityId, SpaceId } from "@/core/types/identifiers"
import { create } from "zustand"
import { devtools } from 'zustand/middleware'
import Rect from "@/core/geom/rect"

export interface Space {
  id: SpaceId
  entities: Map<EntityId, Entities>
}

export interface SpaceState {
  currentSpace: Space | null

  createSpace: (id: SpaceId) => void
  addEntity: (newEntity: Entities) => void
  bulkTransformEntity: (transaction: (entities: Entities[]) => Entities[]) => void
  removeEntity: (entity: Entities) => void
  getEntityAtPosition: (position: Vec) => Entities | null
}

// dont persist since this will rely on outside sources. Or do persist and just merge when possible
export const useSpaceStore = create<SpaceState>()(
  devtools(
    (set, get) => ({
      currentSpace: null,
      createSpace: (id) => {
        set(() => ({
          currentSpace: {
            id,
            entities: new Map<EntityId, Entities>()
          }
        }))
      },
      addEntity: (entity) => {
        set((prev) => {
          if (prev.currentSpace) {
            return {
              currentSpace: {
                ...prev.currentSpace,
                entities: new Map(prev.currentSpace?.entities).set(entity.id, entity)
              }
            }
          } else {
            return prev
          }
        }
      )
      },
      bulkTransformEntity: (transaction: () => Entities[]) => {
        set((prev) => {
          if (prev.currentSpace) {
            const transformedEntities = transaction()
            const newEntitiesMap = new Map<EntityId, Entities>(prev.currentSpace.entities)
            transformedEntities.forEach((entity) => {
              newEntitiesMap.set(entity.id, entity)
            })
            return {
              currentSpace: {
                ...prev.currentSpace,
                entities: newEntitiesMap
              }
            }
          } else {
            return prev
          }
        })
      },
      removeEntity: (_entity: EntityBase) => null,
      getEntityAtPosition: (clickPosition: Vec) => {
        const space = get().currentSpace
        if (!space) {
          return null
        }
        const boxSize = 50
        const hitBox = Rect.fromXYWH(clickPosition.x - boxSize/2, clickPosition.y - boxSize/2, boxSize, boxSize)
        const found = Array.from(space.entities.values()).find((entity) => {
          if (!entity.boundingBox) {
            return false
          }
          return hitBox.intersectsRect(entity.boundingBox)
        })
        return found ?? null
      }
    }),
    {
      name: "space-store"
    }
  )
)


export const TestEntity = () => new Line(null, new Vec(15, 15), new Vec(15, 800), 10, "#FFFFFF")
export const TestEntity1 = () => new Line(null, new Vec(15, 15), new Vec(800, 15), 10, "#FFFFFF")
export const TestEntity2 = () => new Line(null, new Vec(800, 15), new Vec(800, 800), 10, "#FFFFFF")
export const TestEntity3 = () => new Line(null, new Vec(800, 800), new Vec(15, 800), 10, "#FFFFFF")
