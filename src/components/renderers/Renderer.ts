import type { Entities } from "@/core/entities/entity-base"

export interface RendererOptions {
  [key: string]: unknown
  entities: Entities[]
}

export interface Renderer {
  name: string
  enabledByDefault?: boolean
  shouldRender: (
    context: CanvasRenderingContext2D
  ) => boolean
  render: (
    context: CanvasRenderingContext2D,
    options?: RendererOptions
  ) => void
  dispose?: () => void // Cleanup method
}

// Factory function type for creating renderers dynamically
export type RendererFactory<T extends RendererOptions = Record<string, unknown> & Record<"entities", Entities[]>> = (
  options?: T
) => Renderer
