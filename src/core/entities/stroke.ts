import EntityBase, { type Entities } from "@/core/entities/entity-base"
import type Vec from "@/core/geom/vec"
import type { EntityId } from "@/core/types/identifiers"
import Rect from "@/core/geom/rect"

class Stroke extends EntityBase {
  public points: Vec[]
  public width: number
  public colour: string

  constructor(id: EntityId | null = null, points: Vec[], width: number, colour?: string) {
    super(id)

    this.points = points
    this.width = width
    this.colour = colour ?? "#FFFFFF"

    // calcuate bounding box, using the furtherst points
    let minX = points[0].x
    let minY = points[0].y
    let maxX = points[0].x
    let maxY = points[0].y

    points.forEach((pt) => {
      if (pt.x < minX) minX = pt.x
      if (pt.y < minY) minY = pt.y
      if (pt.x > maxX) maxX = pt.x
      if (pt.y > maxY) maxY = pt.y
    })

    this._boundingBox = Rect.fromXYWH(
      minX - this.width / 2,
      minY - this.width / 2,
      (maxX - minX) + this.width,
      (maxY - minY) + this.width
    )
  }

  withPosition(newPosition: Vec): Entities {
    const offset = newPosition.subtract(this.points[0])
    const newPoints = this.points.map((pt) => pt.add(offset))

    return new Stroke(
      this.id,
      newPoints,
      this.width,
      this.colour
    )
  }

  withPositionOffset(offset: Vec): Entities {
    const newPoints = this.points.map((pt) => pt.add(offset))

    return new Stroke(
      this.id,
      newPoints,
      this.width,
      this.colour
    )
  }
}

export default Stroke
