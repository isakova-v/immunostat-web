"use client";
import Link from "next/link";
import { useProjectStore, Project } from "../../lib/store/useProjectStore";
import React, { useState } from "react";

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

function PencilIcon(props: React.ComponentPropsWithoutRef<"svg">) {
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
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
        </svg>
    );
}

function CheckIcon(props: React.ComponentPropsWithoutRef<"svg">) {
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
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function XIcon(props: React.ComponentPropsWithoutRef<"svg">) {
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
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
        </svg>
    );
}

export default function ProjectsPage() {
    const projects = useProjectStore((s) => s.projects);
    const deleteProject = useProjectStore((s) => s.deleteProject);
    const updateProject = useProjectStore((s) => s.updateProject);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Удалить проект? Данные будут потеряны.")) {
            deleteProject(id);
            localStorage.removeItem(`project_data_${id}`);
        }
    };

    const startEdit = (e: React.MouseEvent, p: Project) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(p.id);
        setEditName(p.name);
    };

    const saveEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (editingId && editName.trim()) {
            updateProject(editingId, editName.trim());
        }
        setEditingId(null);
    };

    const cancelEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div className="space-y-4">
            {/* Компактный хедер */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Мои проекты</h2>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Новый проект
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-gray-400 text-sm mb-4">Список пуст</p>
                    <Link
                        href="/projects/new"
                        className="text-sm font-medium text-black underline hover:no-underline"
                    >
                        Создать первый проект
                    </Link>
                </div>
            ) : (
                <ul className="grid gap-2">
                    {projects.map((p) => (
                        <li
                            key={p.id}
                            className="group relative flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                            {editingId === p.id ? (
                                <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-grow text-sm border-b border-black outline-none bg-transparent py-1"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit(e as any);
                                            if (e.key === 'Escape') cancelEdit(e as any);
                                        }}
                                    />
                                    <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={`/projects/${p.id}?tab=data`}
                                        className="flex-grow min-w-0 flex flex-col justify-center h-full absolute inset-0 z-0 pl-3"
                                    >
                                        {/* Пустая ссылка для клика по всей области, текст отображается ниже */}
                                    </Link>

                                    {/* Контент поверх ссылки */}
                                    <div className="pointer-events-none z-10">
                                        <div className="font-medium text-gray-900 text-sm group-hover:text-black transition-colors">
                                            {p.name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 z-10 ml-4 bg-white pl-2">
                                        <button
                                            onClick={(e) => startEdit(e, p)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Переименовать"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, p.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Удалить"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}