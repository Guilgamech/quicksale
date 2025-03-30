import * as SQLite from 'expo-sqlite';

// Open or create the database
let db;
try {
  db = SQLite.openDatabaseSync('ventas.db');
  console.log("Database opened successfully");
} catch (error) {
  console.error("Error opening database:", error);
  // Fallback to try again
  try {
    db = SQLite.openDatabaseSync('ventas.db');
    console.log("Database opened successfully on second attempt");
  } catch (fallbackError) {
    console.error("Fatal error opening database:", fallbackError);
    // We'll handle this in the initDatabase function
  }
}

export const getDatabase = () => {
  return db;
};

// Wrapper for executing SQL queries asynchronously
export const execQueryAsync = async (query, params = []) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  
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

// Check if tables exist
const checkTablesExist = async () => {
  try {
    // Check if productos table exists
    const result = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='productos';"
    );
    return result.length > 0;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
};

// Initialize the database
export const initDatabase = async () => {
  if (!db) {
    throw new Error("Cannot initialize database - connection failed");
  }
  
  try {
    console.log("Initializing database...");
    
    // Check if tables already exist
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log("Database already initialized");
      return true;
    }
    
    // Create products table
    await execQueryAsync(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL
      );
    `);
    console.log("Products table created");

    // Create sales table
    await execQueryAsync(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        total REAL NOT NULL
      );
    `);
    console.log("Sales table created");

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
    console.log("Sales-products table created");
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};