import * as SQLite from 'expo-sqlite';

// Open or create the database
const db = SQLite.openDatabaseSync('ventas.db');

export const getDatabase = () => {
  return db;
};

// Wrapper for executing SQL queries asynchronously
export const execQueryAsync = async (query, params = []) => {
  try {
    // For INSERT statements, use runAsync
    if (query.trim().toUpperCase().startsWith('INSERT')) {
      const result = await db.runAsync(query, params);
      return {
        rows: { _array: [] },
        rowsAffected: result.changes,
        insertId: result.lastInsertRowId
      };
    } 
    // For SELECT statements, use getAllAsync
    else if (query.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await db.getAllAsync(query, params);
      return {
        rows: { _array: rows },
        rowsAffected: 0,
        insertId: null
      };
    }
    // For other statements (UPDATE, DELETE, etc.)
    else {
      const result = await db.runAsync(query, params);
      return {
        rows: { _array: [] },
        rowsAffected: result.changes,
        insertId: null
      };
    }
  } catch (error) {
    console.error(`Error executing query: ${query}`, error);
    throw error;
  }
};

// Initialize the database
export const initDatabase = async () => {
  try {
    // Create products table
    await execQueryAsync(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL
      );
    `);

    // Create sales table
    await execQueryAsync(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        total REAL NOT NULL
      );
    `);

    // Create sales_products relationship table
    await execQueryAsync(`
      CREATE TABLE IF NOT EXISTS ventas_productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE RESTRICT
      );
    `);

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};