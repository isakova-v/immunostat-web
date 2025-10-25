"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "../../../lib/store/useProjectStore";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);

  function create() {
    const id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const now = new Date().toISOString();
    addProject({ id, name, createdAt: now, updatedAt: now, ownerId: "local", memberIds: [], settings: { savedViews: [] }});
    router.push(`/projects/${id}?tab=data`);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Project name</label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Immuno study"
        />
      </div>
      <button
        className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        onClick={create}
        disabled={!name.trim()}
      >
        Create
      </button>
    </div>
  );
}