import { create } from "zustand"
import { devtools } from 'zustand/middleware'
import { Tool, type Tools, type ToolState } from '@/tools/tools'

export interface ToolsState {
  currentTool: Tool<ToolState> | null
  registeredTools: Map<string, Tool<ToolState>>
  
  registerTool: (tool: Tool<ToolState>) => void
  setCurrentTool: (toolId: Tools | null) => void
  getCurrentTool: () => Tool<ToolState> | null
}

export const useToolsStore = create<ToolsState>()(
  devtools(
    (set, get) => ({
      currentTool: null,
      registeredTools: new Map(),
      toolStates: {},
      
      registerTool: (tool) => {
        set((state) => {
          const tools = new Map(state.registeredTools)
          tools.set(tool.id, tool)
          
          return { registeredTools: tools }
        })
      },
      
      setCurrentTool: (toolId) => {
        const state = get()
        const currentTool = state.currentTool
        
        // Deactivate current tool
        if (currentTool) {
          currentTool.onDeactivate?.()
        }
        
        // Activate new tool
        const newTool = toolId ? state.registeredTools.get(toolId) : null
        if (newTool) {
          newTool.onActivate?.()
        }
        
        set({ currentTool: newTool || null })
      },
      
      getCurrentTool: () => get().currentTool
    }),
    { name: "tools-store" }
  )
)