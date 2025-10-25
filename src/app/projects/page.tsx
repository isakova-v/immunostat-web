"use client";
import Link from "next/link";
import { useProjectStore } from "../../lib/store/useProjectStore";

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">Projects</div>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link className="underline" href={`/projects/${p.id}/data`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}