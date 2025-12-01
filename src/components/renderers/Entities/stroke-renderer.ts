import type { RendererFactory } from "@/components/renderers/renderer"
import Stroke from "@/core/entities/stroke"

const StrokeRenderer: RendererFactory = (_options = { entities: [] }) => ({
  name: "StrokeRenderer",
  shouldRender: (_ctx) => true, // use for layers
  render: (ctx, opts) => {
    opts?.entities.forEach(ent => {
      if (!(ent instanceof Stroke)) {
        return
      }
      ctx.beginPath()
      ent.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.lineWidth = ent.width
      ctx.strokeStyle = ent.colour
      ctx.stroke()
    })
  }
})

export default StrokeRenderer
