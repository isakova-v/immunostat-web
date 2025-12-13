import Link from "next/link";
import { AntibodyDistChart } from "@/components/charts/AntibodyDistChart";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Хедер главной страницы */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            IS
          </div>
          <span className="text-xl font-bold text-slate-900">ImmunoStat Web</span>
        </div>
        <Link 
          href="/projects" 
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Мои проекты →
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Приветственная секция */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Визуализация иммунологических данных
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Инструмент для анализа титров антител, HLA-аллелей и построения
            биомедицинских графиков без кода.
          </p>
        </div>

        {/* СЕКЦИЯ С ГРАФИКОМ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Текстовое описание слева */}
          <div className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-slate-800">
              Мгновенная аналитика
            </h2>
            <p className="text-slate-600">
              Загрузите данные и сразу получите распределение показателей.
              Пример ниже показывает базовую гистограмму распределения титров
              по группам риска.
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"/>
                Автоматический подсчет частот
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"/>
                Интерактивные подсказки (Tooltip)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"/>
                Адаптивный дизайн
              </li>
            </ul>
          </div>

          {/* Компонент графика справа */}
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <AntibodyDistChart />
          </div>
          
        </div>
      </div>
    </main>
  );
}
