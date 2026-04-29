import ExcelJS from 'exceljs';

export interface ColumnDefinition {
  header: string;
  key: string;
}

export async function toExcel(rows: Record<string, unknown>[], columns: ColumnDefinition[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('导出数据');

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: Math.max(col.header.length * 2, 20),
  }));

  worksheet.getRow(1).font = { bold: true };

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
