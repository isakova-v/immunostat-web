"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// типизация данных (пока заглушка, потом будут реальные данные из файла)
type DataPoint = {
  name: string;
  count: number;
};

// временные данные
const mockData: DataPoint[] = [
  { name: "Группа A (Низкий)", count: 12 },
  { name: "Группа B (Средний)", count: 45 },
  { name: "Группа C (Высокий)", count: 23 },
  { name: "Группа D (Критич.)", count: 8 },
];

export const AntibodyDistChart = () => {
  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Распределение титров антител
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 90 }} 
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: "#64748b", fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            dy={10}
            height={70}
          />
          <YAxis 
            tick={{ fill: "#64748b", fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {mockData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
