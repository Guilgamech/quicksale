import { execQueryAsync } from './index';
import { getProductoById, updateProductoStock } from './productos';

// Obtener todas las ventas
export const getVentas = async () => {
  try {
    const result = await execQueryAsync(
      'SELECT * FROM ventas ORDER BY fecha DESC;'
    );
    return result.rows._array;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

// Obtener una venta por ID con sus productos
export const getVentaById = async (id) => {
  try {
    const ventaResult = await execQueryAsync(
      'SELECT * FROM ventas WHERE id = ?;',
      [id]
    );

    if (ventaResult.rows._array.length === 0) {
      return null;
    }

    const venta = ventaResult.rows._array[0];

    const productosResult = await execQueryAsync(
      `SELECT vp.*, p.nombre 
       FROM ventas_productos vp 
       JOIN productos p ON vp.producto_id = p.id 
       WHERE vp.venta_id = ?;`,
      [id]
    );

    venta.productos = productosResult.rows._array;
    return venta;
  } catch (error) {
    console.error(`Error al obtener venta con ID ${id}:`, error);
    throw error;
  }
};

// Crear una nueva venta con sus productos
export const createVenta = async (venta) => {
  const { fecha, total, productos } = venta;

  if (!fecha) {
    throw new Error('La fecha es un campo requerido');
  }
  
  if (total === undefined || isNaN(Number(total)) || Number(total) <= 0) {
    throw new Error('El total debe ser un número mayor a 0');
  }
  
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    throw new Error('Se requiere al menos un producto para crear una venta');
  }

  try {
    // Insertar la venta
    const ventaResult = await execQueryAsync(
      'INSERT INTO ventas (fecha, total) VALUES (?, ?);',
      [fecha, Number(total)]
    );
    
    const ventaId = ventaResult.insertId;

    // Insertar los productos de la venta
    for (const item of productos) {
      const { producto_id, cantidad, subtotal } = item;
      
      if (!producto_id) {
        throw new Error('ID de producto es requerido');
      }
      
      if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
        throw new Error('La cantidad debe ser un número mayor a 0');
      }
      
      if (subtotal === undefined || isNaN(Number(subtotal)) || Number(subtotal) < 0) {
        throw new Error('El subtotal debe ser un número mayor o igual a 0');
      }

      // Verificar stock disponible
      const producto = await getProductoById(producto_id);
      if (!producto) {
        throw new Error(`El producto con ID ${producto_id} no existe`);
      }

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      // Insertar relación venta-producto
      await execQueryAsync(
        'INSERT INTO ventas_productos (venta_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?);',
        [ventaId, producto_id, Number(cantidad), Number(subtotal)]
      );

      // Actualizar stock del producto
      const nuevoStock = producto.stock - Number(cantidad);
      await updateProductoStock(producto_id, nuevoStock);
    }

    return { id: ventaId, ...venta };
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

// Obtener ventas por fecha
export const getVentasByDate = async (fecha) => {
  try {
    const result = await execQueryAsync(
      'SELECT * FROM ventas WHERE fecha LIKE ? ORDER BY fecha DESC;',
      [`${fecha}%`]
    );
    return result.rows._array;
  } catch (error) {
    console.error(`Error al obtener ventas por fecha ${fecha}:`, error);
    throw error;
  }
};

// Obtener estadísticas de ventas
export const getVentasStats = async () => {
  try {
    // Total de ventas
    const countResult = await execQueryAsync(
      'SELECT COUNT(*) as total FROM ventas;'
    );
    const totalVentas = countResult.rows._array[0]?.total || 0;

    // Total de ingresos
    const sumResult = await execQueryAsync(
      'SELECT SUM(total) as ingresos FROM ventas;'
    );
    const totalIngresos = sumResult.rows._array[0]?.ingresos || 0;

    // Ventas por día (últimos 7 días)
    const dateResult = await execQueryAsync(
      `SELECT substr(fecha, 1, 10) as dia, COUNT(*) as ventas, SUM(total) as ingresos 
       FROM ventas 
       GROUP BY substr(fecha, 1, 10) 
       ORDER BY dia DESC 
       LIMIT 7;`
    );
    const ventasPorDia = dateResult.rows._array;

    return {
      totalVentas,
      totalIngresos,
      ventasPorDia
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    throw error;
  }
};