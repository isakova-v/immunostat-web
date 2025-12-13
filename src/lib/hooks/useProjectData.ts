"use client";

import { useState, useEffect } from "react";

export function useProjectData(projectId: string) {
  const [data, setData] = useState<any[]>([]); // массив строк из таблицы
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    // Пытаемся достать данные из localStorage
    const storedData = localStorage.getItem(`project_data_${projectId}`);
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed);
      } catch (e) {
        console.error("Ошибка при чтении данных проекта:", e);
      }
    } else {
        console.log("Данных для этого проекта не найдено в LocalStorage");
    }
    
    setLoading(false);
  }, [projectId]);

  return { data, loading };
}
