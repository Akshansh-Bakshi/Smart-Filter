
import React from 'react';
import { SheetRow } from '../types';

interface DataTableProps {
  headers: string[];
  rows: SheetRow[];
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
        <p className="text-lg">No data available to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm custom-scrollbar">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700 w-12 text-center">#</th>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.slice(0, 50).map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-slate-400 text-center text-xs font-mono">{idx + 1}</td>
              {headers.map((header) => (
                <td key={`${idx}-${header}`} className="px-4 py-3 text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                  {row[header]?.toString() || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <div className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-400 font-medium italic">
          Showing first 50 of {rows.length} rows
        </div>
      )}
    </div>
  );
};

export default DataTable;
