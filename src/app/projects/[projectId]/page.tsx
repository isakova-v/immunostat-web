"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { useProjectStore } from "../../../lib/store/useProjectStore";

type Row = Record<string, unknown>;

export default function ProjectPage() {
  const router = useRouter();
  const search = useSearchParams();
  const params = useParams();

  // Получаем projectId
  const rawProjectId = params?.projectId;
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  // Получаем данные о проекте из стора для отображения названия
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useMemo(() =>
          projects.find(p => p.id === projectId),
      [projects, projectId]
  );

  const tab = (search.get("tab") ?? "data") as "data" | "visuals" | "hla" | "settings";

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
    const q = new URLSearchParams(search);
    q.set("tab", nextTab);
    router.push(`?${q.toString()}`, { scroll: false });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!storageKey) {
      alert("Не удалось определить ID проекта.");
      return;
    }

    const f = e.target.files?.[0];
    if (!f) return;

    const ext = f.name.split(".").pop()?.toLowerCase();
    let newRows: Row[] = [];

    try {
      if (ext === "csv") {
        const text = await f.text();
        const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const cols = header.split(",").map((s) => s.trim());
        newRows = lines.map((line) => {
          const vals = line.split(",");
          const obj: Row = {};
          cols.forEach((c, i) => (obj[c] = vals[i] ?? ""));
          return obj;
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await f.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        newRows = XLSX.utils.sheet_to_json<Row>(worksheet, { defval: "" });
      } else {
        alert("Пожалуйста, загрузите файл формата .csv или .xlsx");
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
      alert("Не удалось прочитать файл. Проверьте формат.");
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
      <div className="space-y-4">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">{currentProject ? currentProject.name : 'Загрузка...'}</h1>
            <p className="text-xs text-gray-400 mt-1">ID: {projectId}</p>
          </div>
        </header>

        {/* Вкладки */}
        <div className="flex gap-2">
          {(["data","visuals","hla","settings"] as const).map((t) => (
              <button
                  key={t}
                  onClick={() => go(t)}
                  className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                      tab === t ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
              >
                {t.toUpperCase()}
              </button>
          ))}
        </div>

        {/* Контент вкладок */}
        {tab === "data" && (
            <section className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="space-y-1 w-full max-w-md">
                  <label className="text-sm font-medium block">Upload Data</label>
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={onFile}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">Поддерживаются форматы CSV и XLSX.</p>
                </div>
                {rows.length > 0 && (
                    <button
                        onClick={clearData}
                        className="text-xs text-red-600 hover:underline mb-2"
                    >
                      Очистить данные
                    </button>
                )}
              </div>

              {rows.length > 0 ? (
                  <div className="rounded-md border border-gray-200 overflow-auto max-h-[600px]">
                    <table className="min-w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        {cols.map((c) => (
                            <th key={c} className="px-4 py-2 font-semibold text-gray-700 border-b border-gray-200">
                              {c}
                            </th>
                        ))}
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                      {preview.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50 bg-white">
                            {cols.map((c) => (
                                <td key={c} className="px-4 py-2 text-gray-600">
                                  {String((r as any)[c] ?? "")}
                                </td>
                            ))}
                          </tr>
                      ))}
                      </tbody>
                    </table>
                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t sticky bottom-0">
                      Показано первых 50 строк из {rows.length} (Данные сохранены локально для проекта {currentProject?.name})
                    </div>
                  </div>
              ) : (
                  <div className="p-8 text-center border-2 border-dashed rounded-lg text-gray-400">
                    Нет данных для проекта {currentProject?.name}. Загрузите файл.
                  </div>
              )}
            </section>
        )}

        {tab === "visuals" && (
            <section className="space-y-2">
              <h2 className="text-lg font-medium">Visuals</h2>
              <p className="text-sm text-gray-600">Здесь позже добавим гистограмму/scatter/boxplot (Recharts).</p>
            </section>
        )}

        {tab === "hla" && (
            <section className="space-y-2">
              <h2 className="text-lg font-medium">HLA</h2>
              <p className="text-sm text-gray-600">Здесь позже будет нормализация аллелей и частоты.</p>
            </section>
        )}

        {tab === "settings" && (
            <section className="space-y-2">
              <h2 className="text-lg font-medium">Settings</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Default grouping</li>
                <li>Saved views</li>
                <li>Share link</li>
              </ul>
            </section>
        )}
      </div>
  );
}