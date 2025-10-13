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
  screenToSpace: (screenPosition: Vec) => Vec
  spaceToScreen: (spacePosition: Vec) => Vec

  containsPoint: (point: Vec) => boolean

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
  screenToSpace: (screenPosition: Vec) => {
    const { camera } = get()
    return new Vec(
      (screenPosition.x - camera.viewport.center().x) / camera.zoom,
      (screenPosition.y - camera.viewport.center().y) / camera.zoom
    )
  },

  // Convert space coordinates to screen coordinates
  spaceToScreen: (spacePosition: Vec) => {
    const { camera } = get()
    return new Vec(
      spacePosition.x * camera.zoom + camera.viewport.center().x,
      spacePosition.y * camera.zoom + camera.viewport.center().y
    )
  },

  containsPoint: (point: Vec) => {
    const { camera } = get()
    return camera.viewport.contains(point)
  },

  zoomToPoint: (mousePosition: Vec, zoomDelta: number) => {
    const { camera } = get()
    const oldZoom = camera.zoom
    const newZoom = Math.max(oldZoom + zoomDelta, 0.1)
    
    // Get the world-space point under the mouse BEFORE zoom changes
    const worldPos = get().screenToSpace(mousePosition)
    
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
