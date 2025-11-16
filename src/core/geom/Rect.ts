import Vec from "@/core/geom/vec"
import LineSegment from "@/core/geom/line-segment"

export default class Rect {
  readonly topLeft: Vec
  readonly width: number
  readonly height: number

  constructor(topLeft: Vec, width: number, height: number) {
    this.topLeft = topLeft.copy()
    this.width = width
    this.height = height
  }

  static fromXYWH(x: number, y: number, w: number, h: number): Rect {
    return new Rect(new Vec(x, y), w, h)
  }

  static fromPoints(p1: Vec, p2: Vec): Rect {
    const xMin = Math.min(p1.x, p2.x)
    const xMax = Math.max(p1.x, p2.x)
    const yMin = Math.min(p1.y, p2.y)
    const yMax = Math.max(p1.y, p2.y)
    return new Rect(new Vec(xMin, yMin), xMax - xMin, yMax - yMin)
  }

  get topRight(): Vec {
    return new Vec(this.topLeft.x + this.width, this.topLeft.y)
  }

  get bottomLeft(): Vec {
    return new Vec(this.topLeft.x, this.topLeft.y + this.height)
  }

  get bottomRight(): Vec {
    return new Vec(this.topLeft.x + this.width, this.topLeft.y + this.height)
  }

  // side LineSegments
  get top(): LineSegment {
    return new LineSegment(this.topLeft, this.topRight)
  }

  get bottom(): LineSegment {
    return new LineSegment(this.bottomLeft, this.bottomRight)
  }

  get left(): LineSegment {
    return new LineSegment(this.topLeft, this.bottomLeft)
  }

  get right(): LineSegment {
    return new LineSegment(this.topRight, this.bottomRight)
  }

  get points(): Vec[] {
    return [
      this.topLeft,
      this.bottomLeft,
      this.bottomRight,
      this.topRight
    ]
  }

  // area and center
  area(): number {
    return Math.abs(this.width * this.height)
  }

  center(): Vec {
    return new Vec(this.topLeft.x + this.width / 2, this.topLeft.y + this.height / 2)
  }

  /**
   * Return a new Rect positioned so its center equals the provided point.
   * Non-mutating (returns a new Rect).
   */
  withCenter(center: Vec): Rect {
    const newTopLeft = new Vec(center.x - this.width / 2, center.y - this.height / 2)
    return new Rect(newTopLeft, this.width, this.height)
  }

  // contains point (inclusive)
  contains(point: Vec): boolean {
    return (
      point.x >= this.topLeft.x &&
      point.x <= this.topLeft.x + this.width &&
      point.y >= this.topLeft.y &&
      point.y <= this.topLeft.y + this.height
    )
  }

  // intersects another rect (AABB)
  intersectsRect(other: Rect): boolean {
    const thisRight = this.topLeft.x + this.width
    const thisBottom = this.topLeft.y + this.height
    const otherRight = other.topLeft.x + other.width
    const otherBottom = other.topLeft.y + other.height

    return !(
      other.topLeft.x >= thisRight ||
      otherRight <= this.topLeft.x ||
      other.topLeft.y >= thisBottom ||
      otherBottom <= this.topLeft.y
    )
  }

  // convert to four edges
  toEdges(): LineSegment[] {
    return [this.top, this.right, this.bottom, this.left]
  }

  // translate rect by vector (returns new Rect)
  translate(offset: Vec): Rect {
    return new Rect(this.topLeft.add(offset), this.width, this.height)
  }

  // inflate rect by dx/dy (expands outwards)
  inflate(dx: number, dy: number): Rect {
    const newTopLeft = new Vec(this.topLeft.x - dx, this.topLeft.y - dy)
    return new Rect(newTopLeft, this.width + dx * 2, this.height + dy * 2)
  }
}
