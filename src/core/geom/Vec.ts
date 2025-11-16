class Vec {
  protected _x: number
  protected _y: number

  constructor(posx: number = 0, posy: number = 0) {
    this._x = posx
    this._y = posy
  }

  /**
   * Gets the x coordinate
   */
  get x(): number {
    return this._x
  }

  /**
   * Gets the y coordinate
   */
  get y(): number {
    return this._y
  }

  /**
   * Sets the x coordinate
   */
  setX(x: number): void {
    this._x = x
  }

  /**
   * Sets the y coordinate
   */
  setY(y: number): void {
    this._y = y
  }

  /**
   * Sets both x and y coordinates
   */
  set(x: number, y: number): void {
    this._x = x
    this._y = y
  }

  /**
   * Gets the vector as [x, y] array
   */
  toArray(): [number, number] {
    return [this._x, this._y]
  }

  /**
   * Creates vector from [x, y] array
   * @static
   */
  static fromArray(arr: [number, number]): Vec {
    return new Vec(arr[0], arr[1])
  }

  /**
   * Gets the magnitude (length) of the vector
   */
  magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y)
  }

  /**
   * Gets the squared magnitude (for performance when only comparison needed)
   */
  magnitudeSquared(): number {
    return this._x * this._x + this._y * this._y
  }

  /**
   * Normalizes the vector (makes it unit length)
   * Returns new normalized vector, keeps original unchanged
   */
  normalize(): Vec {
    const mag = this.magnitude()
    if (mag === 0) return new Vec(0, 0)
    return new Vec(this._x / mag, this._y / mag)
  }

  /**
   * Creates a normalized copy of this vector
   */
  copyNormalized(): Vec {
    return this.normalize()
  }

  /**
   * Adds another vector and returns a new vector (non-mutating)
   */
  add(vec: Vec): Vec {
    return new Vec(this._x + vec.x, this._y + vec.y)
  }

  /**
   * Adds another vector in-place (mutates this vector)
   */
  addInPlace(vec: Vec): Vec {
    this._x += vec.x
    this._y += vec.y
    return this
  }

  /**
   * Subtracts another vector and returns a new vector (non-mutating)
   */
  subtract(vec: Vec): Vec {
    return new Vec(this._x - vec.x, this._y - vec.y)
  }

  /**
   * Subtracts another vector in-place (mutates this vector)
   */
  subtractInPlace(vec: Vec): Vec {
    this._x -= vec.x
    this._y -= vec.y
    return this
  }

  /**
   * Multiplies this vector by a scalar and returns a new vector (non-mutating)
   */
  multiplyScalar(scalar: number): Vec {
    return new Vec(this._x * scalar, this._y * scalar)
  }

  /**
   * Multiplies this vector by a scalar in-place (mutates this vector)
   */
  multiplyScalarInPlace(scalar: number): Vec {
    this._x *= scalar
    this._y *= scalar
    return this
  }

  /**
   * Divides this vector by a scalar and returns a new vector (non-mutating)
   */
  divideScalar(scalar: number): Vec {
    if (scalar === 0) {
      throw new Error("Cannot divide vector by zero")
    }
    return new Vec(this._x / scalar, this._y / scalar)
  }

  /**
   * Divides this vector by a scalar in-place (mutates this vector)
   */
  divideScalarInPlace(scalar: number): Vec {
    if (scalar === 0) {
      throw new Error("Cannot divide vector by zero")
    }
    this._x /= scalar
    this._y /= scalar
    return this
  }

  /**
   * Scales this vector by individual x and y factors and returns a new vector (non-mutating)
   */
  scale(xScale: number, yScale: number): Vec {
    return new Vec(this._x * xScale, this._y * yScale)
  }

  /**
   * Scales this vector in-place (mutates this vector)
   */
  scaleInPlace(xScale: number, yScale: number): Vec {
    this._x *= xScale
    this._y *= yScale
    return this
  }

  /**
   * Creates a copy of this vector
   */
  copy(): Vec {
    return new Vec(this._x, this._y)
  }

  /**
   * Returns true if two vectors are approximately equal (within epsilon)
   */
  equals(vec: Vec, epsilon: number = 1e-6): boolean {
    return Math.abs(this._x - vec.x) < epsilon && Math.abs(this._y - vec.y) < epsilon
  }

  /**
   * Calculates the dot product with another vector
   */
  dot(vec: Vec): number {
    return this._x * vec.x + this._y * vec.y
  }

  /**
   * Calculates the cross product magnitude (2D version - returns Vec pair for compatibility)
   */
  cross(vec: Vec): Vec {
    return new Vec(this._x * vec.y, this._y * vec.x)
  }

  /**
   * Calculates the distance to another vector
   */
  distanceTo(vec: Vec): number {
    const dx = this._x - vec.x
    const dy = this._y - vec.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculates the squared distance to another vector
   */
  distanceToSquared(vec: Vec): number {
    const dx = this._x - vec.x
    const dy = this._y - vec.y
    return dx * dx + dy * dy
  }

  /**
   * Creates a vector perpendicular to this one (rotates 90 degrees clockwise)
   */
  perpendicular(): Vec {
    return new Vec(this._y, -this._x)
  }

  /**
   * Creates a vector perpendicular to this one (rotates 90 degrees counterclockwise)
   */
  perpendicularCCW(): Vec {
    return new Vec(-this._y, this._x)
  }

  /**
   * Rotates this vector by an angle in radians and returns a new vector (non-mutating)
   */
  rotate(angle: number): Vec {
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    return new Vec(
      this._x * cosA - this._y * sinA,
      this._x * sinA + this._y * cosA
    )
  }

  /**
   * Rotates this vector in-place (mutates this vector)
   */
  rotateInPlace(angle: number): Vec {
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const x = this._x * cosA - this._y * sinA
    const y = this._x * sinA + this._y * cosA
    this._x = x
    this._y = y
    return this
  }

  /**
   * Reflects this vector over a normal vector and returns a new vector (non-mutating)
   */
  reflect(normal: Vec): Vec {
    const dot = this.dot(normal)
    const nx2 = normal.x * normal.x
    const ny2 = normal.y * normal.y
    const nMagSq = nx2 + ny2

    if (nMagSq === 0) {
      return this.copy()
    }

    return new Vec(
      this._x - 2 * dot * normal.x / nMagSq,
      this._y - 2 * dot * normal.y / nMagSq
    )
  }

  /**
   * Reflects this vector in-place (mutates this vector)
   */
  reflectInPlace(normal: Vec): Vec {
    const dot = this.dot(normal)
    const nx2 = normal.x * normal.x
    const ny2 = normal.y * normal.y
    const nMagSq = nx2 + ny2

    if (nMagSq === 0) {
      return this
    }

    this._x -= 2 * dot * normal.x / nMagSq
    this._y -= 2 * dot * normal.y / nMagSq
    return this
  }

  /**
   * Clamps the vector's magnitude between min and max and returns a new vector (non-mutating)
   */
  clampMagnitude(min: number, max: number): Vec {
    const mag = this.magnitude()
    if (mag === 0) {
      return this.copy()
    }
    if (mag < min) {
      const scale = min / mag
      return this.multiplyScalar(scale)
    } else if (mag > max) {
      const scale = max / mag
      return this.multiplyScalar(scale)
    }
    return this.copy()
  }

  /**
   * Clamps the vector's magnitude between min and max in-place (mutates this vector)
   */
  clampMagnitudeInPlace(min: number, max: number): Vec {
    const mag = this.magnitude()
    if (mag === 0) {
      return this
    }
    if (mag < min) {
      const scale = min / mag
      return this.multiplyScalarInPlace(scale)
    } else if (mag > max) {
      const scale = max / mag
      return this.multiplyScalarInPlace(scale)
    }
    return this
  }

  /**
   * Limits the vector's magnitude to a maximum value and returns a new vector (non-mutating)
   */
  limit(max: number): Vec {
    return this.clampMagnitude(0, max)
  }

  /**
   * Limits the vector's magnitude to a maximum value in-place (mutates this vector)
   */
  limitInPlace(max: number): Vec {
    return this.clampMagnitudeInPlace(0, max)
  }

  /**
   * Linear interpolation between this vector and target (returns new vector)
   */
  lerp(target: Vec, t: number): Vec {
    if (t <= 0) return this.copy()
    if (t >= 1) return target.copy()

    return new Vec(
      this._x + (target.x - this._x) * t,
      this._y + (target.y - this._y) * t
    )
  }

  /**
   * Gets the angle of this vector in radians (relative to positive x-axis)
   */
  angle(): number {
    return Math.atan2(this._y, this._x)
  }

  negate(): Vec {
    return new Vec(-this._x, -this._y)
  }

  /**
   * Sets the magnitude and returns a new vector (non-mutating)
   */
  setMagnitude(mag: number): Vec {
    const currentMag = this.magnitude()
    if (currentMag === 0) {
      return new Vec(mag, 0)
    } else {
      return this.multiplyScalar(mag / currentMag)
    }
  }

  /**
   * Sets the magnitude in-place (mutates this vector)
   */
  setMagnitudeInPlace(mag: number): Vec {
    const currentMag = this.magnitude()
    if (currentMag === 0) {
      this._x = mag
      this._y = 0
    } else {
      this.multiplyScalarInPlace(mag / currentMag)
    }
    return this
  }

  /**
   * Static method to create vector from polar coordinates (angle, magnitude)
   */
  static fromPolar(angle: number, magnitude: number): Vec {
    return new Vec(
      magnitude * Math.cos(angle),
      magnitude * Math.sin(angle)
    )
  }

  /**
   * Sets this vector from polar coordinates in-place (mutates this vector)
   */
  fromPolarInPlace(angle: number, magnitude: number): Vec {
    this._x = magnitude * Math.cos(angle)
    this._y = magnitude * Math.sin(angle)
    return this
  }

  /**
   * Static method to create a zero vector
   */
  static zero(): Vec {
    return new Vec(0, 0)
  }

  /**
   * Static method to create a unit vector in the x direction
   */
  static unitX(): Vec {
    return new Vec(1, 0)
  }

  /**
   * Static method to create a unit vector in the y direction
   */
  static unitY(): Vec {
    return new Vec(0, 1)
  }

  /**
   * Static method to create a random unit vector
   */
  static random(): Vec {
    const angle = Math.random() * 2 * Math.PI
    return Vec.fromPolar(angle, 1)
  }

  /**
   * Mutating version of fromPolar (alias)
   */
  fromPolar(angle: number, magnitude: number): Vec {
    return this.fromPolarInPlace(angle, magnitude)
  }

  /**
   * String representation of the vector
   */
  toString(): string {
    return `Vec(${this._x.toFixed(2)}, ${this._y.toFixed(2)})`
  }

  /**
   * JSON representation
   */
  toJSON(): {
    x: number
    y: number
  } {
    return { x: this._x, y: this._y }
  }
}

export default Vec
