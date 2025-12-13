"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjectStore } from "../../../lib/store/useProjectStore";

function ArrowLeftIcon(props: React.ComponentPropsWithoutRef<"svg">) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
    );
}

export default function NewProjectPage() {
    const router = useRouter();
    const addProject = useProjectStore((s) => s.addProject);
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (addProject) {
            const newProject = {
                id: crypto.randomUUID(),
                name: name.trim(),
                createdAt: new Date().toISOString(),
            };
            addProject(newProject);
            router.push("/projects");
        } else {
            alert("Ошибка: Метод addProject не найден в store");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-8">
            <div>
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Назад к списку
                </Link>
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Новый проект</h1>
                    <p className="text-gray-500">Создайте пространство для ваших данных</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none">
                        Название проекта
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Анализ продаж Q3"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Link
                        href="/projects"
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-50 h-10 px-4 py-2"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 disabled:opacity-50 h-10 px-4 py-2"
                    >
                        Создать
                    </button>
                </div>
            </form>
        </div>
    );
}