import type { EntityId } from "../types/identifiers"
import type Line from "./Line"

export type Entities = Line 

abstract class EntityBase {
  protected _id: EntityId | null

  constructor () {
    this._id = null
  }

  get id(): EntityId {
    return this._id ?? "test" as EntityId
  }
  
}

export default EntityBase