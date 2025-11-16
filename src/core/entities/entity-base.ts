import Rect from "@/core/geom/rect"
import type Vec from "@/core/geom/vec"
import { createEntityId, type EntityId } from "../types/identifiers"
import type Line from "@/core/entities/line"

export type Entities = Line 

abstract class EntityBase {
  protected _id: EntityId | null
  protected _boundingBox: Rect

  constructor (id: EntityId | null = null) {
    this._id = id ?? createEntityId()
    this._boundingBox = Rect.fromXYWH(0, 0, 0, 0)
  }

  get id(): EntityId {
    return this._id ?? "test" as EntityId
  }

  get boundingBox(): Rect {
    return this._boundingBox
  }

  abstract withPositionOffset(offset: Vec): Entities

  abstract withPosition(newPosition: Vec): Entities

}

export default EntityBase