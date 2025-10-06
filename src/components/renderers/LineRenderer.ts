import type { RendererFactory } from "./Renderer";

const LineRenderer: RendererFactory = (_options = { entities: [] }) => ({
  name: "LineRenderer",
  shouldRender: (_ctx) => true,
  render: (ctx, opts) => {
    opts?.entities.forEach(ent => {
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
