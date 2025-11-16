import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { RendererFactory } from "@/components/renderers/Renderer"
import LineRenderer from '@/components/renderers/Entities/line-renderer'

export interface CanvasConfig {
  width: number
  height: number
  backgroundColor: string // always hex (make a brand)
}

export interface CanvasRendererState {
  config: CanvasConfig

  lastRenderTime: number
  isRendering: boolean
  activeLayerNames: LayerNames[]

  setCanvasConfig: (config: Partial<CanvasConfig>) => void
  updateCanvasState: (newState: Partial<CanvasRendererState>) => void
  addLayer: (layer: CanvasLayer) => void
  removeLayer: (layerName: LayerNames) => void
  toggleLayer: (LayerNames: LayerNames) => void

  clearRenderers: () => void
  triggerRender: () => void
  startRendering: () => void
  stopRendering: () => void
  _internalRender: () => void
}

export interface CanvasLayer {
  name: LayerNames
  renderers: RendererFactory[]

  activeRendererNames: RendererNames[]
}

export const useCanvasStore = create<CanvasRendererState>()(
  devtools(
    (set, get) => ({
      config: {
        width: 600,
        height: 600,
        backgroundColor: '#000000'
      },
      lastRenderTime: 0,
      isRendering: false,
      activeLayerNames: ['lines'],

      setCanvasConfig: (config: Partial<CanvasConfig>) => null,
      updateCanvasState: (newState: Partial<CanvasRendererState>) => null,
      addLayer: (layer: CanvasLayer) => null,
      removeLayer: (layerName: LayerNames) => null,
      toggleLayer: (LayerNames: LayerNames) => null,

      clearRenderers: () => {
        set({ activeLayerNames: [] })
        get()._internalRender()
      },
      triggerRender: () => {
        const { isRendering } = get()
        if (!isRendering) {
          get()._internalRender()
        }
      },
      startRendering: () => {
        set({ isRendering: true })
        const renderLoop = () => {
          if (get().isRendering) {
            get()._internalRender()
            requestAnimationFrame(renderLoop)
          }
        }
        renderLoop()
      },
      stopRendering: () => {
        set({ 
          isRendering: false,
          lastRenderTime: performance.now(),
        })
      },
      _internalRender: () => {
        set({ lastRenderTime: performance.now() })
      }
    })
  )
)

export const useCanvasConfig = () => useCanvasStore(state => state.config)
export const useCanvasState = () => useCanvasStore(state => state)
export const useIsRendering = () => useCanvasStore(state => state.isRendering)

type LayerNames = 'lines'
type RendererNames = 'line'

export const LayersToRenderersMap: CanvasLayer[] = [
  {
    name: "lines", // this will probably turn into something like "geometry"
    renderers: [LineRenderer],
    activeRendererNames: []
  }
  // Then more for images and other such things
]
