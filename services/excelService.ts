
import { SheetRow } from "../types";

// Note: XLSX is loaded via script tag in index.html
declare const XLSX: any;

export const parseExcelFile = (file: File): Promise<{ headers: string[], rows: SheetRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to objects with defval to ensure all keys exist in all rows
        // Using defval: "" ensures that keys are created even for empty cells
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as SheetRow[];
        
        if (rows.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        // Extract headers directly from the first row's keys to ensure 100% alignment
        // between the headers array and the object property names.
        // We filter out internal XLSX keys (starting with __) unless they are valid headers.
        const headers = Object.keys(rows[0]).filter(key => !key.startsWith('__EMPTY'));

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (rows: SheetRow[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");
  XLSX.writeFile(workbook, `${fileName.split('.')[0]}_filtered.xlsx`);
};
