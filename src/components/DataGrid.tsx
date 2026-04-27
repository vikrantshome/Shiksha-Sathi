"use client";

import React, { useState, useEffect } from 'react';

interface Column {
  key: string;
  header: string;
  width?: string;
  editable?: boolean;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  rowKey: string;
  onCellChange?: (rowId: string, colKey: string, value: any) => void;
}

export default function DataGrid({ columns, data, rowKey, onCellChange }: DataGridProps) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleBlur = (rowId: string, colKey: string, e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onCellChange) {
      onCellChange(rowId, colKey, val);
    }
  };

  return (
    <div className="overflow-x-auto border border-[#c0c8c6]/30 rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#f0ede9] sticky top-0 z-10">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={col.key} 
                className={`p-3 font-black uppercase tracking-[0.1em] text-[0.65rem] text-[#404847] border-b border-[#c0c8c6]/30 ${i === 0 ? 'sticky left-0 bg-[#f0ede9] z-20' : ''}`}
                style={{ minWidth: col.width || '120px' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#c0c8c6]/10">
          {localData.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-[#f6f3ef] transition-colors">
              {columns.map((col, i) => (
                <td 
                  key={`${row[rowKey]}-${col.key}`} 
                  className={`p-0 border-r border-[#c0c8c6]/10 last:border-r-0 ${i === 0 ? 'sticky left-0 bg-white z-10 px-4 py-3 font-semibold text-[#1c1c1a] shadow-[1px_0_0_rgba(192,200,198,0.3)]' : 'px-4 py-3 text-[#404847]'}`}
                >
                  {col.editable ? (
                    <input 
                      type="number"
                      defaultValue={row[col.key]}
                      onBlur={(e) => handleBlur(row[rowKey], col.key, e)}
                      className="w-full h-full p-0 text-center bg-transparent outline-none focus:text-[#12423f] font-bold transition-all"
                    />
                  ) : (
                    <div>
                      {row[col.key]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
