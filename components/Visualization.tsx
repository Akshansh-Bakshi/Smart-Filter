
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { SheetRow } from '../types';

interface VisualizationProps {
  data: SheetRow[];
  headers: string[];
}

const Visualization: React.FC<VisualizationProps> = ({ data, headers }) => {
  const chartData = useMemo(() => {
    // Take first 15 rows for clarity
    const displayRows = data.slice(0, 15);
    
    // Identify numeric columns
    const numericHeaders = headers.filter(h => {
      const val = displayRows[0]?.[h];
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });

    if (numericHeaders.length === 0) return null;

    // Use the first numeric column for Y, and first string-like column for X
    const xKey = headers.find(h => !numericHeaders.includes(h)) || headers[0];
    const yKey = numericHeaders[0];

    return {
      rows: displayRows.map(row => ({
        name: row[xKey]?.toString().substring(0, 10) || 'Item',
        value: parseFloat(row[yKey]) || 0,
        originalValue: row[yKey]
      })),
      xKey,
      yKey
    };
  }, [data, headers]);

  if (!chartData || chartData.rows.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400">
        No numeric data found to visualize in current selection.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Statistical Preview: {chartData.yKey} by {chartData.xKey}</h4>
        <p className="text-xs text-slate-500">Visualizing top 15 results</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={11} 
              tick={{fill: '#64748b'}} 
              axisLine={{stroke: '#e2e8f0'}} 
            />
            <YAxis 
              fontSize={11} 
              tick={{fill: '#64748b'}} 
              axisLine={{stroke: '#e2e8f0'}} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
               {chartData.rows.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Visualization;
