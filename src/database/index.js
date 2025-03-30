import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Ensure database directory exists
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite');
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
};

// Open or create the database
let db = null;

const openDatabase = async () => {
  try {
    // Ensure directory exists
    await ensureDirExists();
    
    // Open database
    console.log("Opening database...");
    db = SQLite.openDatabaseSync('ventas.db');
    console.log("Database opened successfully");
    
    // Initialize tables
    await initTables();
    
    return true;
  } catch (error) {
    console.error("Error opening database:", error);
    return false;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

// Initialize database tables
const initTables = async () => {
  try {
    console.log("Initializing database tables...");
    
    // Create products table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL
      );
    `);
    
    // Create sales table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        total REAL NOT NULL
      );
    `);
    
    // Create sales_products relationship table
    await db.execAsync(`
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
    
    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
};

// Wrapper for executing SQL queries asynchronously
export const execQueryAsync = async (query, params = []) => {
  // Make sure database is initialized
  if (!db) {
    await initDatabase();
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

// Initialize the database
export const initDatabase = async () => {
  if (db) {
    return true; // Already initialized
  }
  
  return await openDatabase();
};

// Initialize database when module is imported
initDatabase().catch(error => {
  console.error("Failed to initialize database:", error);
});