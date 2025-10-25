"use client";
import { create } from "zustand";

type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  memberIds: string[];
  settings: { savedViews: any[] };
};

type State = {
  projects: Project[];
  addProject: (p: Project) => void;
};

export const useProjectStore = create<State>((set) => ({
  projects: [],
  addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
}));