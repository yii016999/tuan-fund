import { create } from 'zustand'

interface GroupStore {
  activeGroupId: string
  setActiveGroupId: (id: string) => void
}

export const useGroupStore = create<GroupStore>((set) => ({
  activeGroupId: '',
  setActiveGroupId: (id) => set({ activeGroupId: id }),
}))