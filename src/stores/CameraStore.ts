import Rect from '@/core/geom/Rect'
import Vec from '@/core/geom/Vec'
import { create } from 'zustand'

export interface Camera {
  zoom: number
  viewport: Rect
}

export interface CameraState {
  camera: Camera
  setCamera: (camera: Camera) => void
  updateCamera: (partial: Partial<Camera>) => void
  
  // Helper functions for coordinate mapping
  screenToSpace: (screenX: number, screenY: number) => Vec
  spaceToScreen: (worldX: number, worldY: number) => Vec

  zoomToPoint: (mousePosition: Vec, zoomDelta: number) => void
}

export const useCameraStore = create<CameraState>((set, get) => ({
  camera: { position: new Vec(0, 0), zoom: 1, viewport: Rect.fromXYWH(0, 0, 200, 200) },

  setCamera: (camera) => set({ camera }),

  updateCamera: (partial) =>
    set((state) => ({
      camera: { ...state.camera, ...partial },
    })),

  // Convert screen coordinates to space coordinates
  screenToSpace: (screenX: number, screenY: number) => {
    const { camera } = get()
    return new Vec(
      (screenX - camera.viewport.center().x) / camera.zoom,
      (screenY - camera.viewport.center().y) / camera.zoom
    )
  },

  // Convert space coordinates to screen coordinates
  spaceToScreen: (worldX: number, worldY: number) => {
    const { camera } = get()
    return new Vec(
      worldX * camera.zoom + camera.viewport.center().x,
      worldY * camera.zoom + camera.viewport.center().y
    )
  },
  zoomToPoint: (mousePosition: Vec, zoomDelta: number) => {
    const { camera } = get()
    const oldZoom = camera.zoom
    const newZoom = Math.max(oldZoom + zoomDelta, 0.1)
    
    // Get the world-space point under the mouse BEFORE zoom changes
    const worldPos = get().screenToSpace(mousePosition.x, mousePosition.y)
    
    // Calculate new viewport center so that worldPos stays under the mouse
    // Formula: newCenter = mousePosition - worldPos * newZoom
    const newCenter = new Vec(
      mousePosition.x - worldPos.x * newZoom,
      mousePosition.y - worldPos.y * newZoom
    )
    
    set((state) => ({
      camera: { 
        ...state.camera, 
        viewport: camera.viewport.withCenter(newCenter),
        zoom: newZoom 
      },
    }))
  }
}))
