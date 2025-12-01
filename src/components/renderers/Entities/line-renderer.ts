import type { RendererFactory } from "@/components/renderers/renderer"
import Line from "@/core/entities/line"

const LineRenderer: RendererFactory = (_options = { entities: [] }) => ({
  name: "LineRenderer",
  shouldRender: (_ctx) => true, // use for layers
  render: (ctx, opts) => {
    opts?.entities.forEach(ent => {
      if (!(ent instanceof Line)) {
        return
      }
      ctx.beginPath()
      ctx.moveTo(ent.start.x, ent.start.y)
      ctx.lineTo(ent.end.x, ent.end.y)
      ctx.lineWidth = ent.width
      ctx.strokeStyle = ent.colour
      ctx.stroke()
    })
  }
})

export default LineRenderer
