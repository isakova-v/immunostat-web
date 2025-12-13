"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

type Row = Record<string, unknown>;

interface VisualsSectionProps {
  data: Row[];
}

export const VisualsSection = ({ data }: VisualsSectionProps) => {
  // 1. Если данных нет, просим загрузить
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Нет данных для отображения.</p>
        <p className="text-sm">Перейдите на вкладку "DATA" и загрузите таблицу.</p>
      </div>
    );
  }

  // 2. Получаем список всех колонок
  const columns = useMemo(() => Object.keys(data[0]), [data]);

  // 3. Состояние для выбора осей
  // По умолчанию пытаемся угадать: X = первая колонка (имя), Y = вторая (число)
  const [xAxis, setXAxis] = useState<string>(columns[0]);
  const [yAxis, setYAxis] = useState<string>(columns[1] || columns[0]);
  const [chartType, setChartType] = useState<"bar" | "scatter">("bar");

  // 4. Подготовка данных (преобразуем числа из строк, если надо)
  const chartData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      // Принудительно делаем Y числом, чтобы график не сломался
      [yAxis]: Number(row[yAxis]) || 0, 
    }));
  }, [data, yAxis]);

  return (
    <div className="space-y-6">
      {/* Панель настроек */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Ось X (Категории)</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="block w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Ось Y (Значения)</label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="block w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Тип графика</label>
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-sm rounded ${chartType === "bar" ? "bg-white shadow text-black" : "text-gray-500"}`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType("scatter")}
              className={`px-3 py-1 text-sm rounded ${chartType === "scatter" ? "bg-white shadow text-black" : "text-gray-500"}`}
            >
              Scatter
            </button>
          </div>
        </div>
      </div>

      {/* Область графика */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[500px]">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {yAxis} <span className="text-gray-400 font-normal">по группам</span> {xAxis}
        </h3>
        
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey={xAxis} 
                angle={-45} 
                textAnchor="end" 
                interval={0}
                tick={{ fontSize: 12, fill: "#64748b" }}
                height={70}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip 
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey={yAxis} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#2563eb" />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="category" 
                dataKey={xAxis} 
                name={xAxis} 
                angle={-45} 
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis 
                type="number" 
                dataKey={yAxis} 
                name={yAxis} 
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <ZAxis range={[100, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data" data={chartData} fill="#2563eb" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
