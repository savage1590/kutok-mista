"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, GripVertical } from "lucide-react";
import { saveSizeCharts } from "@/app/[locale]/admin/settings-actions";

export interface SizeChart {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string>[];
}

export default function SizeChartsClient({ initialSizeCharts }: { initialSizeCharts: SizeChart[] }) {
  const [charts, setCharts] = useState<SizeChart[]>(initialSizeCharts || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await saveSizeCharts(charts);
    if (error) {
      alert("Помилка при збереженні: " + error);
    } else {
      alert("Збережено успішно!");
      setEditingChartId(null);
    }
    setIsSaving(false);
  };

  const addNewChart = () => {
    const newChart: SizeChart = {
      id: "chart_" + Date.now().toString(),
      name: "Нова розмірна сітка",
      columns: ["Розмір", "Груди (см)", "Довжина (см)"],
      rows: [
        { "Розмір": "S", "Груди (см)": "50", "Довжина (см)": "70" },
        { "Розмір": "M", "Груди (см)": "53", "Довжина (см)": "72" }
      ]
    };
    setCharts([...charts, newChart]);
    setEditingChartId(newChart.id);
  };

  const deleteChart = (id: string) => {
    if (confirm("Видалити цю сітку?")) {
      setCharts(charts.filter(c => c.id !== id));
      if (editingChartId === id) setEditingChartId(null);
    }
  };

  const addColumn = (chartId: string) => {
    const colName = prompt("Назва нової колонки:");
    if (!colName) return;
    setCharts(charts.map(c => {
      if (c.id !== chartId) return c;
      if (c.columns.includes(colName)) return c;
      const newCols = [...c.columns, colName];
      const newRows = c.rows.map(r => ({ ...r, [colName]: "" }));
      return { ...c, columns: newCols, rows: newRows };
    }));
  };

  const deleteColumn = (chartId: string, colIndex: number) => {
    if (!confirm("Видалити колонку?")) return;
    setCharts(charts.map(c => {
      if (c.id !== chartId) return c;
      const colName = c.columns[colIndex];
      const newCols = c.columns.filter((_, i) => i !== colIndex);
      const newRows = c.rows.map(r => {
        const newRow = { ...r };
        delete newRow[colName];
        return newRow;
      });
      return { ...c, columns: newCols, rows: newRows };
    }));
  };

  const addRow = (chartId: string) => {
    setCharts(charts.map(c => {
      if (c.id !== chartId) return c;
      const emptyRow: Record<string, string> = {};
      c.columns.forEach(col => emptyRow[col] = "");
      return { ...c, rows: [...c.rows, emptyRow] };
    }));
  };

  const deleteRow = (chartId: string, rowIndex: number) => {
    setCharts(charts.map(c => {
      if (c.id !== chartId) return c;
      return { ...c, rows: c.rows.filter((_, i) => i !== rowIndex) };
    }));
  };

  const updateCell = (chartId: string, rowIndex: number, colName: string, value: string) => {
    setCharts(charts.map(c => {
      if (c.id !== chartId) return c;
      const newRows = [...c.rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [colName]: value };
      return { ...c, rows: newRows };
    }));
  };

  const updateChartName = (chartId: string, name: string) => {
    setCharts(charts.map(c => c.id === chartId ? { ...c, name } : c));
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={addNewChart}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Створити сітку
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-foreground text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Збереження..." : "Зберегти всі зміни"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List of charts */}
        <div className="md:col-span-1 flex flex-col gap-2">
          {charts.map(chart => (
            <div 
              key={chart.id}
              onClick={() => setEditingChartId(chart.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${
                editingChartId === chart.id ? "border-brand bg-brand/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-sm truncate pr-2">{chart.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteChart(chart.id); }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {charts.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm border border-dashed rounded-xl">
              Немає сіток
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="md:col-span-3">
          {editingChartId ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {charts.filter(c => c.id === editingChartId).map(chart => (
                <div key={chart.id} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Назва розмірної сітки</label>
                    <input 
                      type="text" 
                      value={chart.name}
                      onChange={(e) => updateChartName(chart.id, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="w-10"></th>
                          {chart.columns.map((col, cIdx) => (
                            <th key={cIdx} className="p-2 border-b-2 border-gray-200 font-semibold text-gray-700 relative group">
                              {col}
                              <button 
                                onClick={() => deleteColumn(chart.id, cIdx)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                title="Видалити колонку"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </th>
                          ))}
                          <th className="p-2 border-b-2 border-gray-200 w-10 text-right">
                            <button onClick={() => addColumn(chart.id)} className="text-brand hover:text-brand/80" title="Додати колонку">
                              <Plus className="w-5 h-5 inline" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {chart.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50 group">
                            <td className="p-2 text-gray-300">
                              <GripVertical className="w-4 h-4" />
                            </td>
                            {chart.columns.map((col, cIdx) => (
                              <td key={cIdx} className="p-1">
                                <input 
                                  type="text"
                                  value={row[col] || ""}
                                  onChange={(e) => updateCell(chart.id, rIdx, col, e.target.value)}
                                  className="w-full p-2 rounded border-transparent hover:border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand focus:bg-white bg-transparent outline-none transition-all"
                                  placeholder="..."
                                />
                              </td>
                            ))}
                            <td className="p-2 text-right">
                              <button 
                                onClick={() => deleteRow(chart.id, rIdx)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button 
                    onClick={() => addRow(chart.id)}
                    className="self-start text-sm font-medium text-brand hover:text-brand/80 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Додати рядок
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 border-dashed h-64 flex items-center justify-center text-gray-400">
              Виберіть сітку зліва або створіть нову
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
