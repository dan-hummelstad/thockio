import Vec from "./Vec"

export interface SegmentIntersection {
  intersects: boolean
  point?: Vec
  t1?: number
  t2?: number
}

export default class LineSegment {
  readonly a: Vec
  readonly b: Vec

  constructor(a: Vec, b: Vec) {
    // keep segment endpoints immutable copies
    this.a = a.copy()
    this.b = b.copy()
  }

  // length and squared length
  length(): number {
    return this.a.distanceTo(this.b)
  }

  lengthSq(): number {
    return this.a.distanceToSquared(this.b)
  }

  // direction vector from a -> b (not normalized)
  direction(): Vec {
    return this.b.subtract(this.a)
  }

  // normalized direction (unit vector)
  directionUnit(): Vec {
    const d = this.direction()
    return d.normalize()
  }

  // point along segment at parameter t in [0,1]
  pointAt(t: number): Vec {
    t = Math.max(0, Math.min(1, t))
    const dx = this.b.x - this.a.x
    const dy = this.b.y - this.a.y
    return new Vec(this.a.x + dx * t, this.a.y + dy * t)
  }

  // midpoint convenience
  midpoint(): Vec {
    return this.pointAt(0.5)
  }

  // project external point onto the (infinite) line, return parameter t
  projectParameter(point: Vec): number {
    const vx = this.b.x - this.a.x
    const vy = this.b.y - this.a.y
    const wx = point.x - this.a.x
    const wy = point.y - this.a.y
    const denom = vx * vx + vy * vy
    if (denom === 0) return 0
    return (vx * wx + vy * wy) / denom
  }

  // closest point on the segment to the given point
  closestPoint(point: Vec): Vec {
    const t = this.projectParameter(point)
    const tClamped = Math.max(0, Math.min(1, t))
    return this.pointAt(tClamped)
  }

  // distance from point to segment
  distanceToPoint(point: Vec): number {
    return this.closestPoint(point).distanceTo(point)
  }

  // robust segment-segment intersection test (returns intersection point and params if intersects)
  intersectSegment(other: LineSegment): SegmentIntersection {
    // Based on parametric intersection:
    // a + t*(b-a) = c + u*(d-c)
    const x1 = this.a.x, y1 = this.a.y
    const x2 = this.b.x, y2 = this.b.y
    const x3 = other.a.x, y3 = other.a.y
    const x4 = other.b.x, y4 = other.b.y

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

    // parallel or collinear
    if (Math.abs(denom) < 1e-12) {
      return { intersects: false }
    }

    const t = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
    const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const ix = x1 + t * (x2 - x1)
      const iy = y1 + t * (y2 - y1)
      return { intersects: true, point: new Vec(ix, iy), t1: t, t2: u }
    }

    return { intersects: false }
  }
}
