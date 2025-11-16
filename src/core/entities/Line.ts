import Rect from "@/core/geom/rect"
import Vec from "@/core/geom/vec"
import type { EntityId } from "../types/identifiers"
import EntityBase, { type Entities } from "./entity-base"


class Line extends EntityBase {
  public start: Vec
  public end: Vec
  public width: number
  public colour: string

  constructor (id: EntityId | null = null, start: Vec, end: Vec, width: number, colour?: string) {
    super(id)

    this.start = start
    this.end = end
    this.width = width
    this.colour = colour ?? "#FFFFFF"

    this._boundingBox = Rect.fromPoints(
      this.start.add(new Vec(-this.width / 2, -this.width / 2)),
      this.end.add(new Vec(this.width / 2, this.width / 2))
    )
  }

  withPositionOffset(offset: Vec): Entities {
    return new Line(
      this.id,
      this.start.add(offset),
      this.end.add(offset),
      this.width,
      this.colour
    )
  }

  withPosition(newPosition: Vec): Entities {
    return new Line(
      this.id,
      newPosition,
      newPosition.add(this.end.subtract(this.start)),
      this.width,
      this.colour
    )
  }
  
}

export default Line
