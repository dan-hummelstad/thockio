import type { GestureHandlers } from "@/hooks/use-gestures"
import type { StoreApi, UseBoundStore } from "zustand"

export type Tools = "selection" | "spline" | "pen"

export type ToolState = object // base tool state properties (shared between all tools)

export abstract class Tool<T extends ToolState> {
  abstract id: Tools
  abstract name: string

  // Zustand store
  protected abstract createStore(): UseBoundStore<StoreApi<T>>
  public store: UseBoundStore<StoreApi<T>>

  constructor() {
    this.store = this.createStore()
  }

  // Lifecycle
  onActivate?(): void
  onDeactivate?(): void

  // Events using @use-gesture/react types
  onPointerDown?: GestureHandlers["onMouseDown"]
  onPointerMove?: GestureHandlers["onMouseMove"]
  onPointerUp?: GestureHandlers["onMouseUp"]
  onWheel?: GestureHandlers["onWheel"]
  // onKeyDown?: (event: KeyboardEvent) => void
  // onKeyUp?: (event: KeyboardEvent) => void

  // Rendering
  abstract render(ctx: CanvasRenderingContext2D): void

  // Convenience methods
  getState(): T {
    return this.store.getState()
  }

  subscribe(): (listener: (state: T, prevState: T) => void) => () => void {
    return this.store.subscribe
  }

  setState(updates: Partial<T>): void {
    this.store.setState(updates)
  }

  reset(): void {
    // Override to reset tool-specific state
  }
}
