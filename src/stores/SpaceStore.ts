import type { Entities } from "@/core/entities/EntityBase"
import type EntityBase from "@/core/entities/EntityBase"
import Line from "@/core/entities/Line"
import Vec from "@/core/geom/Vec"
import type { SpaceId } from "@/core/types/identifiers"
import { create } from "zustand"
import { devtools } from 'zustand/middleware'

export interface Space {
  id: SpaceId
  entities: Entities[]
}

export interface SpaceState {
  currentSpace: Space | null

  createSpace: (id: SpaceId) => void
  addEntity: (newEntity: Entities) => void
  bulkTransformEntity: (transaction: () => Entities[]) => void
  removeEntity: (entity: Entities) => void
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
            entities: []
          }
        }))
      },
      addEntity: (entity) => {
        set((prev) => {
          if (prev.currentSpace) {
            return {
              currentSpace: {
                ...prev.currentSpace,
                entities: [...prev.currentSpace?.entities, entity]
              }
            }
          } else {
            return prev
          }
        }
      )
      },
      bulkTransformEntity: (transaction: () => EntityBase[]) => null,
      removeEntity: (entity: EntityBase) => null
    }),
    {
      name: "space-store"
    }
  )
)


export const TestEntity = () => new Line(new Vec(15, 15), new Vec(15, 800), 10, "#FFFFFF")
export const TestEntity1 = () => new Line(new Vec(15, 15), new Vec(800, 15), 10, "#FFFFFF")
export const TestEntity2 = () => new Line(new Vec(800, 15), new Vec(800, 800), 10, "#FFFFFF")
export const TestEntity3 = () => new Line(new Vec(800, 800), new Vec(15, 800), 10, "#FFFFFF")