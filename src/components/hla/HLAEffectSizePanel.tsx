"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { computeHedgesG, benjaminiHochberg } from "@/lib/hla/stats";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

type Row = Record<string, any>;

export function HLAEffectSizePanel() {
  const [hla, setHla] = useState<Row[]>([]);
  const [pheno, setPheno] = useState<Row[]>([]);
  const [rareGenes, setRareGenes] = useState<Set<string>>(new Set());
  const [field, setField] = useState<"first" | "second">("first");
  const [results, setResults] = useState<any[]>([]);

  // Defaults like in python script
  const minCarriers = 5;
  const minNonCarriers = 5;

  // ---------- utils ----------

  function parseRareGenes(txt: string): Set<string> {
    const genes = new Set<string>();
    for (const line of txt.split(/\r?\n/)) {
      const m = line.trim().match(/^(HLA-[A-Z0-9]+)/);
      if (m) genes.add(m[1]);
    }
    return genes;
  }

  async function handleExcelFile(file: File, setter: (rows: Row[]) => void) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
    setter(json);
  }

  async function handleTextFile(file: File, setter: (s: Set<string>) => void) {
    const txt = await file.text();
    setter(parseRareGenes(txt));
  }

  // IMPORTANT: make IDs comparable between Excel-as-number vs text
  function normalizeSampleId(raw: any): string {
    if (raw == null) return "";
    let s = String(raw).trim();
    if (!s) return "";

    // Excel often turns ids into "12345.0"
    if (/^\d+(\.0+)?$/.test(s)) {
      s = s.split(".")[0];
    }

    // Remove leading zeros so "00123" == "123"
    s = s.replace(/^0+/, "");
    if (s === "") s = "0";

    return s;
  }

  function normalizeAllele(raw: any): string | null {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s || s === "-" || s === "NA" || s === "NaN") return null;
    if (!s.includes("*")) return null;

    const [gene, rest] = s.split("*", 2);
    const parts = rest.split(":").filter(Boolean);
    const take = field === "first" ? 1 : 2;

    if (!gene || parts.length === 0) return null;

    return `${gene}*${parts.slice(0, take).join(":")}`;
  }

  const titerKey = useMemo(() => {
    if (!pheno.length) return null;
    return Object.keys(pheno[0]).find((c) => c.endsWith("_ME_ml")) ?? null;
  }, [pheno]);

  // ---------- main analysis ----------

  function runAnalysis() {
    console.log("[HLA] RUN start");
    console.log("[HLA] hla rows:", hla.length);
    console.log("[HLA] pheno rows:", pheno.length);

    if (!hla.length || !pheno.length) {
      alert("Загрузите HLA и phenotype файлы");
      return;
    }

    console.log("[HLA] phenotype columns:", Object.keys(pheno[0]));
    console.log("[HLA] titerKey:", titerKey);

    if (!titerKey) {
      alert("Не найдена колонка *_ME_ml в phenotype файле");
      return;
    }

    // ---- titers: ZLIMS ID -> log10(titer) ----
    const titers: Record<string, number> = {};
    for (const row of pheno) {
      const id = normalizeSampleId(row["ZLIMS ID"]);
      const val = Number(row[titerKey]);

      if (!id) continue;
      if (!Number.isFinite(val) || val <= 0) continue;

      titers[id] = Math.log10(val);
    }

    const allSamples = Object.keys(titers);
    console.log("[HLA] titers count:", allSamples.length);

    if (allSamples.length === 0) {
      alert("Не удалось извлечь титры: проверьте 'ZLIMS ID' и колонку титров");
      return;
    }

    // ---- diagnose overlap between pheno ids and hla sample_id ----
    const hlaIds = new Set<string>();
    for (const row of hla) {
      const s = normalizeSampleId(row["sample_id"]);
      if (s) hlaIds.add(s);
    }
    let overlap = 0;
    for (const id of allSamples) {
      if (hlaIds.has(id)) overlap += 1;
    }
    console.log("[HLA] unique HLA sample_id:", hlaIds.size);
    console.log("[HLA] overlap phenotype∩HLA:", overlap);
    console.log("[HLA] example pheno id:", allSamples[0]);
    console.log("[HLA] example hla id:", Array.from(hlaIds)[0]);

    if (overlap === 0) {
      alert(
        "Не найдено совпадающих ID между phenotype (ZLIMS ID) и HLA (sample_id). " +
          "Проверьте, что это одна и та же выборка и что ID совпадают."
      );
      // We still continue (maybe some rare overlap exists after filtering), but usually it's a hard stop.
      // return;
    }

    // ---- genes list from HLA table ----
    const hlaCols = Object.keys(hla[0] ?? {}).filter((c) => c.startsWith("HLA-"));
    const genes = Array.from(new Set(hlaCols.map((c) => c.split("_")[0]))).filter(
      (g) => !rareGenes.has(g)
    );

    console.log("[HLA] genes kept:", genes.length);

    // ---- build carriers sets: (gene|allele) -> Set(sample_id) ----
    const byAllele: Record<string, Set<string>> = {};
    let longCount = 0;

    for (const row of hla) {
      const sample = normalizeSampleId(row["sample_id"]);
      if (!sample || !(sample in titers)) continue;

      for (const gene of genes) {
        const a1 = normalizeAllele(row[`${gene}_1`]);
        const a2 = normalizeAllele(row[`${gene}_2`]);

        for (const a of [a1, a2]) {
          if (!a) continue;
          const key = `${gene}|${a}`;
          byAllele[key] ||= new Set<string>();
          byAllele[key].add(sample);
          longCount += 1;
        }
      }
    }

    console.log("[HLA] long-like records:", longCount);
    console.log("[HLA] unique gene|allele keys:", Object.keys(byAllele).length);

    // ---- effect sizes ----
    const effects: any[] = [];
    const keys = Object.keys(byAllele);

    for (const key of keys) {
      const [gene, allele] = key.split("|");
      const carriers = Array.from(byAllele[key]);
      const noncarriers = allSamples.filter((s) => !byAllele[key].has(s));

      if (carriers.length < minCarriers || noncarriers.length < minNonCarriers) {
        continue;
      }

      const t1 = carriers.map((s) => titers[s]);
      const t0 = noncarriers.map((s) => titers[s]);

      const res = computeHedgesG(t1, t0);
      if (!res) continue;

      effects.push({
        gene,
        allele,
        n_carriers: carriers.length,
        n_noncarriers: noncarriers.length,
        ...res, // expected keys: g, se, ciLow/ciHigh (or similar), p
      });
    }

    console.log("[HLA] effects computed:", effects.length);

    if (effects.length === 0) {
      alert(
        `Нет результатов: возможно, слишком строгие пороги (min_carriers=${minCarriers}, min_noncarriers=${minNonCarriers}) ` +
          `или совпадений ID слишком мало (overlap phenotype∩HLA = ${overlap}).`
      );
      return;
    }

    // ---- FDR ----
    const q = benjaminiHochberg(effects.map((e) => e.p));
    effects.forEach((e, i) => (e.q = q[i]));

    effects.sort((a, b) => a.q - b.q || Math.abs(b.g) - Math.abs(a.g));

    console.log("[HLA] RUN done");
    setResults(effects);
  }

  // ---------- UI ----------

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">combined_hla_out.xlsx</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) =>
              e.target.files?.[0] && handleExcelFile(e.target.files[0], setHla)
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">phenotype (HBV.xlsx)</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) =>
              e.target.files?.[0] && handleExcelFile(e.target.files[0], setPheno)
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            hla_rare_alleles.txt (optional)
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={(e) =>
              e.target.files?.[0] && handleTextFile(e.target.files[0], setRareGenes)
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Field</label>
          <select
            value={field}
            onChange={(e) => setField(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="first">First field</option>
            <option value="second">Second field</option>
          </select>
        </div>

        <div className="text-xs text-gray-600">
          <div>
            min_carriers: <span className="font-mono">{minCarriers}</span>
          </div>
          <div>
            min_noncarriers: <span className="font-mono">{minNonCarriers}</span>
          </div>
          <div>
            titerKey: <span className="font-mono">{titerKey ?? "—"}</span>
          </div>
          <div>
            rareGenes: <span className="font-mono">{rareGenes.size}</span>
          </div>
        </div>

        <button
          onClick={runAnalysis}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Run
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-bold mb-2">Effect sizes (Hedges’ g)</h3>

          <div className="overflow-auto max-h-[400px]">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {Object.keys(results[0]).map((c) => (
                    <th key={c} className="px-3 py-2 border-b text-left font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.q < 0.05 ? "bg-green-50" : ""}>
                    {Object.keys(r).map((c) => (
                      <td key={c} className="px-3 py-1 border-b">
                        {String((r as any)[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* "Forest-like" bar plot: top 40 */}
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.slice(0, 40)} layout="vertical" margin={{ left: 140 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="g" />
                <YAxis type="category" dataKey="allele" width={140} />
                <Tooltip />
                <Bar dataKey="g" radius={[4, 4, 4, 4]}>
                  {results.slice(0, 40).map((_, i) => (
                    <Cell key={i} fill="#2563eb" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}