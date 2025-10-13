import type { RendererFactory } from "../Renderer";

const SplineToolRenderer: RendererFactory = (options = { entities: [] }) => ({
  name: "SplineToolRenderer",
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

export default SplineToolRenderer
