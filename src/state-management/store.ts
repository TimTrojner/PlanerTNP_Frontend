import { create } from 'zustand/react'
import { type Task } from '../types/task'

interface StoreState {
  schedule: Task[]
  setSchedule: (schedule: Task[]) => void
  addTask: (task: Task) => void
}

const useStore = create<StoreState>((set) => ({
  schedule: [],
  setSchedule: (schedule) => set({ schedule }),
  addTask: (task) => set((state) => ({ schedule: [...state.schedule, task] })),
}))

export const tasksStore = useStore((state) => state.schedule)
export const setTasksStore = useStore((state) => state.setSchedule)
export const addTaskStore = useStore((state) => state.addTask)
