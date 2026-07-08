import * as XLSX from "xlsx";

export function exportToExcel({ data, headers, filename }) {
  const rows = data.map((item) => headers.map(({ key, value }) => (typeof value === "function" ? value(item) : item[key] ?? "")));
  const worksheet = XLSX.utils.aoa_to_sheet([headers.map(({ label }) => label), ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
