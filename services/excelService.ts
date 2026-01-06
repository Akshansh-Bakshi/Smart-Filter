
import { SheetRow } from "../types";

// Note: XLSX is loaded via script tag in index.html for simplicity in this environment
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
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = XLSX.utils.sheet_to_json(worksheet) as SheetRow[];

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
