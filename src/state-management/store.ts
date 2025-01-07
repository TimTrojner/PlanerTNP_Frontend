import { create } from 'zustand/react'
import { type Task } from '../types/task'

interface StoreState {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
}

const useStore = create<StoreState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}))

export const tasksStore = useStore((state) => state.tasks)
export const setTasksStore = useStore((state) => state.setTasks)
export const addTaskStore = useStore((state) => state.addTask)
