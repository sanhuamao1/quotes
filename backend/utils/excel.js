const ExcelJS = require("exceljs");

async function toExcel(rows, columns) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("导出数据");

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: Math.max(col.header.length * 2, 20),
  }));

  worksheet.getRow(1).font = { bold: true };

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { toExcel };
