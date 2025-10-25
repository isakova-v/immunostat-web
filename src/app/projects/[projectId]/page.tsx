"use client";
import { useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Row = Record<string, unknown>;

export default function ProjectPage({ params }: { params: { projectId: string }}) {
  const router = useRouter();
  const search = useSearchParams();
  const tab = (search.get("tab") ?? "data") as "data" | "visuals" | "hla" | "settings";

  // локальное состояние данных (для MVP; позже можно вынести в стор)
  const [rows, setRows] = useState<Row[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function go(nextTab: typeof tab) {
    const q = new URLSearchParams(search);
    q.set("tab", nextTab);
    router.push(`?${q.toString()}`, { scroll: false });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      const text = await f.text();
      const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = header.split(",").map((s) => s.trim());
      const parsed = lines.map((line) => {
        const vals = line.split(",");
        const obj: Row = {};
        cols.forEach((c, i) => (obj[c] = vals[i] ?? ""));
        return obj;
      });
      setRows(parsed);
    } else {
      // простейший XLSX-парсер не тянем — покажем сообщение
      alert("Для XLSX добавим позже. Сейчас загрузите CSV.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const cols = useMemo(() => Array.from(new Set(rows.flatMap(Object.keys))), [rows]);
  const preview = rows.slice(0, 50);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Project: {params.projectId}</h1>
      </header>

      {/* Вкладки без внешних зависимостей */}
      <div className="flex gap-2">
        {(["data","visuals","hla","settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => go(t)}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              tab === t ? "bg-black text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      {tab === "data" && (
        <section className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Upload CSV</label>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={onFile} className="block" />
            <p className="text-xs text-gray-500">XLSX добавим позже, пока используйте CSV с заголовком колонок.</p>
          </div>

          {preview.length > 0 && (
            <div className="rounded-md border overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{cols.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      {cols.map((c) => <td key={c} className="px-3 py-1.5">{String((r as any)[c] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
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