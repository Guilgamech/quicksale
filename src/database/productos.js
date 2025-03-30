import { execQueryAsync } from './index';

// Get all products
export const getProductos = async () => {
  try {
    const result = await execQueryAsync(
      'SELECT * FROM productos ORDER BY nombre;'
    );
    return result.rows._array;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get a product by ID
export const getProductoById = async (id) => {
  try {
    const result = await execQueryAsync(
      'SELECT * FROM productos WHERE id = ?;',
      [id]
    );
    return result.rows._array.length > 0 ? result.rows._array[0] : null;
  } catch (error) {
    console.error(`Error getting product with ID ${id}:`, error);
    throw error;
  }
};

// Create a new product
export const createProducto = async (producto) => {
  try {
    const { nombre, precio, stock } = producto;
    
    // Validate nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre es un campo requerido y no puede estar vacío');
    }
    
    // Validate precio
    if (precio === undefined || precio === null || isNaN(Number(precio)) || Number(precio) <= 0) {
      throw new Error('El precio debe ser un número mayor a 0');
    }
    
    // Validate stock
    if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
      throw new Error('El stock debe ser un número mayor o igual a 0');
    }
    
    // Ensure nombre is properly trimmed and not empty
    const nombreTrimmed = nombre.trim();
    
    // Convert precio and stock to numbers
    const precioNum = Number(precio);
    const stockNum = Number(stock);
    
    // Use execQueryAsync with the new approach
    const result = await execQueryAsync(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?);',
      [nombreTrimmed, precioNum, stockNum]
    );
    
    // Return the complete product object
    return {
      id: result.insertId,
      nombre: nombreTrimmed,
      precio: precioNum,
      stock: stockNum
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProducto = async (id, producto) => {
  try {
    const { nombre, precio, stock } = producto;
    
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre es un campo requerido y no puede estar vacío');
    }
    
    if (precio === undefined || precio === null || isNaN(Number(precio)) || Number(precio) <= 0) {
      throw new Error('El precio debe ser un número mayor a 0');
    }
    
    if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
      throw new Error('El stock debe ser un número mayor o igual a 0');
    }
    
    // Ensure nombre is properly trimmed
    const nombreTrimmed = nombre.trim();
    
    // Convert precio and stock to numbers
    const precioNum = Number(precio);
    const stockNum = Number(stock);
    
    const result = await execQueryAsync(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?;',
      [nombreTrimmed, precioNum, stockNum, id]
    );
    
    if (result.rowsAffected === 0) {
      throw new Error(`No se encontró un producto con ID ${id}`);
    }
    
    return {
      id,
      nombre: nombreTrimmed,
      precio: precioNum,
      stock: stockNum
    };
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProducto = async (id) => {
  try {
    const result = await execQueryAsync(
      'DELETE FROM productos WHERE id = ?;',
      [id]
    );
    
    if (result.rowsAffected === 0) {
      throw new Error(`No se encontró un producto con ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

// Update product stock
export const updateProductoStock = async (id, newStock) => {
  try {
    if (newStock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    
    const result = await execQueryAsync(
      'UPDATE productos SET stock = ? WHERE id = ?;',
      [newStock, id]
    );
    
    if (result.rowsAffected === 0) {
      throw new Error(`No se encontró un producto con ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating stock for product with ID ${id}:`, error);
    throw error;
  }
};

// Search products by name
export const searchProductos = async (query) => {
  try {
    const result = await execQueryAsync(
      "SELECT * FROM productos WHERE nombre LIKE ? ORDER BY nombre;",
      [`%${query}%`]
    );
    return result.rows._array;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};