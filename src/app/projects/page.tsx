"use client";
import Link from "next/link";
import { useProjectStore } from "../../lib/store/useProjectStore";
import React from "react";

function TrashIcon(props: React.ComponentPropsWithoutRef<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

function PlusIcon(props: React.ComponentPropsWithoutRef<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

export default function ProjectsPage() {
    const projects = useProjectStore((s) => s.projects);
    const deleteProject = useProjectStore((s) => s.deleteProject);

    const handleDelete = (id: string) => {
        if (confirm("Вы уверены, что хотите удалить этот проект? Все данные будут потеряны.")) {
            // Удаляем сам проект из списка (стор)
            deleteProject(id);
            // Очищаем данные таблицы (localStorage)
            localStorage.removeItem(`project_data_${id}`);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Список проектов</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Управляйте своими наборами данных и аналитикой.
                    </p>
                </div>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Новый проект
                </Link>
            </header>

            {projects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
                    <p className="text-gray-500 mb-4">Проектов пока нет</p>
                    <Link
                        href="/projects/new"
                        className="text-sm font-medium text-black underline hover:no-underline"
                    >
                        Создать первый проект
                    </Link>
                </div>
            ) : (
                <ul className="grid gap-3">
                    {projects.map((p) => (
                        <li
                            key={p.id}
                            className="group flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-black transition-all"
                        >
                            <Link
                                href={`/projects/${p.id}?tab=data`}
                                className="flex-grow min-w-0"
                            >
                                <div>
                                    <div className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {p.name}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">ID: {p.id}</div>
                                </div>
                            </Link>

                            <button
                                onClick={() => handleDelete(p.id)}
                                className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                title="Удалить проект"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}