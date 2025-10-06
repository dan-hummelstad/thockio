import type Vec from "../geom/Vec";
import EntityBase from "./EntityBase";


class Line extends EntityBase {
  public start: Vec
  public end: Vec
  public width: number
  public colour: string

  constructor (start: Vec, end: Vec, width: number, colour?: string) {
    super()

    this.start = start
    this.end = end
    this.width = width
    this.colour = colour ?? "#FFFFFF"
  }
  
}

export default Line