"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useProjectStore } from "../../../lib/store/useProjectStore";

function ArrowLeftIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}

type Row = Record<string, unknown>;

export default function ProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = params?.projectId as string;

  // Получаем данные о проекте из стора для отображения названия
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useMemo(() =>
          projects.find(p => p.id === projectId),
      [projects, projectId]
  );

  const tab = (searchParams.get("tab") ?? "data") as "data" | "visuals" | "hla" | "settings";

  // локальное состояние данных
  const [rows, setRows] = useState<Row[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ключ для хранения данных в LocalStorage
  const storageKey = projectId ? `project_data_${projectId}` : null;

  // Восстанавливаем данные при монтировании компонента или смене projectId
  useEffect(() => {
    if (!storageKey) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRows(parsed);
          return;
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке сохраненных данных:", error);
    }

    setRows([]);
  }, [storageKey]);

  function go(nextTab: typeof tab) {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", nextTab);
    router.push(`?${newParams.toString()}`);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!storageKey) {
      alert("Не удалось определить ID проекта.");
      return;
    }

    const f = e.target.files?.[0];
    if (!f) return;

    // Мы используем XLSX.read для всех форматов, так как библиотека
    // автоматически определяет формат (CSV, TSV, ODS, XLS, XLSX) по содержимому.
    let newRows: Row[] = [];

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      if (workbook.SheetNames.length === 0) {
        alert("Файл не содержит листов с данными.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Берем первый лист
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Конвертируем в JSON
      newRows = XLSX.utils.sheet_to_json<Row>(worksheet, { defval: "" });

      if (newRows.length === 0) {
        alert("Не удалось найти данные в таблице.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setRows(newRows);

      try {
        localStorage.setItem(storageKey, JSON.stringify(newRows));
      } catch (storageError) {
        console.error("Ошибка при сохранении в LocalStorage:", storageError);
        alert("Данные отображены, но не сохранены (файл слишком большой).");
      }

    } catch (error) {
      console.error("Ошибка парсинга файла:", error);
      alert("Не удалось прочитать файл. Убедитесь, что формат поддерживается (Excel, CSV, TSV, ODS).");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearData() {
    if (!storageKey) return;
    if (confirm("Вы уверены, что хотите удалить загруженные данные для этого проекта?")) {
      setRows([]);
      localStorage.removeItem(storageKey);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const cols = useMemo(() => {
    if (rows.length === 0) return [];
    return Array.from(new Set(rows.flatMap(Object.keys)));
  }, [rows]);

  const preview = rows.slice(0, 50);

  if (!projectId) {
    return <div className="p-4">Загрузка проекта...</div>;
  }

  return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
          <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors w-fit"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Список проектов
          </Link>
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{currentProject ? currentProject.name : 'Проект'}</h1>
              {currentProject && <p className="text-xs text-gray-400 font-mono mt-1 select-all">{currentProject.id}</p>}
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 border-b border-gray-100 pb-1">
          {(["data","visuals","hla","settings"] as const).map((t) => (
              <button
                  key={t}
                  onClick={() => go(t)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      tab === t
                          ? "bg-black text-white shadow-sm"
                          : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {t.toUpperCase()}
              </button>
          ))}
        </div>

        {/* Контент вкладок */}
        {tab === "data" && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-end justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2 w-full max-w-md">
                  <label className="text-sm font-semibold text-gray-700 block">Загрузка данных</label>
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .tsv, .xlsx, .xls, .ods, .txt"
                      onChange={onFile}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Поддерживаются CSV, TSV, XLSX, XLS, ODS.</p>
                </div>
                {rows.length > 0 && (
                    <button
                        onClick={clearData}
                        className="text-sm text-red-600 hover:text-red-800 hover:underline px-2 py-1"
                    >
                      Очистить таблицу
                    </button>
                )}
              </div>

              {rows.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
                    <div className="overflow-auto max-h-[600px]">
                      <table className="min-w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          {cols.map((c) => (
                              <th key={c} className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200 bg-gray-100">
                                {c}
                              </th>
                          ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {preview.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 bg-white transition-colors">
                              {cols.map((c) => (
                                  <td key={c} className="px-4 py-2.5 text-gray-600">
                                    {String((r as any)[c] ?? "")}
                                  </td>
                              ))}
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between items-center">
                      <span>Показано 50 строк из {rows.length}</span>
                      <span>Данные сохранены локально</span>
                    </div>
                  </div>
              ) : (
                  <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="text-gray-400 mb-2">Нет данных</div>
                    <div className="text-sm text-gray-500">Загрузите таблицу (CSV, Excel, ODS), чтобы начать работу</div>
                  </div>
              )}
            </section>
        )}

        {tab === "visuals" && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 border rounded-xl bg-white shadow-sm">
                <h2 className="text-lg font-medium mb-2">Визуализация</h2>
                <p className="text-sm text-gray-600">Здесь позже добавим гистограмму/scatter/boxplot (Recharts).</p>
              </div>
            </section>
        )}

        {tab === "hla" && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 border rounded-xl bg-white shadow-sm">
                <h2 className="text-lg font-medium mb-2">HLA Анализ</h2>
                <p className="text-sm text-gray-600">Здесь позже будет нормализация аллелей и частоты.</p>
              </div>
            </section>
        )}

        {tab === "settings" && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 border rounded-xl bg-white shadow-sm">
                <h2 className="text-lg font-medium mb-4">Настройки проекта</h2>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>Группировка по умолчанию</li>
                  <li>Сохраненные виды</li>
                  <li>Публичная ссылка</li>
                </ul>
              </div>
            </section>
        )}
      </div>
  );
}