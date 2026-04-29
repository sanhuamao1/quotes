const BOM = "﻿";

function escapeField(value) {
  if (value == null) return "";
  const str = String(value);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCSV(rows, columns) {
  const header = columns.map((c) => c.header).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeField(row[c.key])).join(","),
  );
  return BOM + [header, ...lines].join("\n");
}

module.exports = { toCSV };
