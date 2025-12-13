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
        <div className="max-w-md mx-auto mt-6 space-y-6">
            <div>
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors mb-4"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Список проектов
                </Link>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Новый проект</h1>
                    <p className="text-gray-500 text-sm">Введите название для вашего нового рабочего пространства.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Название проекта
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Анализ когорты 2024"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Link
                        href="/projects"
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-gray-100 h-10 px-4 py-2"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                    >
                        Создать
                    </button>
                </div>
            </form>
        </div>
    );
}