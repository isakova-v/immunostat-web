import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, name: string) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
          projects: [],
          addProject: (project) =>
              set((state) => ({ projects: [project, ...state.projects] })),
          deleteProject: (id) =>
              set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
              })),
          updateProject: (id, name) =>
              set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === id ? { ...p, name } : p
                ),
              })),
        }),
        {
          name: "project-storage",
          storage: createJSONStorage(() => localStorage),
        }
    )
);
