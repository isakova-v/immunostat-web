"use client";
import Link from "next/link";
import { useProjectStore } from "../../lib/store/useProjectStore";

export default function ProjectsPage() {
    const projects = useProjectStore((s) => s.projects);
    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-xl font-bold">Projects</h1>
                <p className="text-sm text-muted-foreground text-gray-500">Select a project to view data.</p>
            </header>

            <ul className="space-y-2">
                {projects.map((p) => (
                    <li key={p.id} className="group">
                        <Link
                            className="flex items-center justify-between p-3 rounded-md border bg-white hover:border-black transition-colors"
                            href={`/projects/${p.id}?tab=data`}
                        >
                            <span className="font-medium group-hover:underline">{p.name}</span>
                            <span className="text-xs text-gray-400">ID: {p.id}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}