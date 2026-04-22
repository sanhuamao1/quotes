// db/db.js
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "finance.db");
let db = null;

function getDB() {
  if (!db) {
    try {
      db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      console.log("Connected to the SQLite database.");
    } catch (err) {
      console.error("Error opening database:", err.message);
      throw err;
    }
  }
  return db;
}

function closeDB() {
  if (db) {
    try {
      db.close();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error closing database:", err.message);
    } finally {
      db = null;
    }
  }
}

module.exports = { getDB, closeDB };
