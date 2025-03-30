import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Modal, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Button, Card } from '../components';
import { getProductos } from '../database/productos';
import { createVenta } from '../database/ventas';

const SalesScreen = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cargar productos al iniciar
  useEffect(() => {
    loadProductos();
  }, []);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (productos.length > 0) {
      const filtered = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchQuery, productos]);

  // Función para cargar productos desde la base de datos
  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      // Filtrar solo productos con stock disponible
      const productosDisponibles = data.filter(producto => producto.stock > 0);
      setProductos(productosDisponibles);
      setFilteredProductos(productosDisponibles);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para agregar producto al carrito
  const handleAddToCart = (product) => {
    setCurrentProduct(product);
    setCantidad('1');
    setModalVisible(true);
  };

  // Agregar producto al carrito
  const addProductToCart = () => {
    const cantidadNum = parseInt(cantidad);
    
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return;
    }
    
    if (cantidadNum > currentProduct.stock) {
      Alert.alert('Error', `Solo hay ${currentProduct.stock} unidades disponibles`);
      return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingIndex = carrito.findIndex(item => item.producto_id === currentProduct.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedCarrito = [...carrito];
      const newCantidad = updatedCarrito[existingIndex].cantidad + cantidadNum;
      
      if (newCantidad > currentProduct.stock) {
        Alert.alert('Error', `No puedes agregar más de ${currentProduct.stock} unidades de este producto`);
        return;
      }
      
      updatedCarrito[existingIndex] = {
        ...updatedCarrito[existingIndex],
        cantidad: newCantidad,
        subtotal: newCantidad * currentProduct.precio
      };
      
      setCarrito(updatedCarrito);
    } else {
      // Agregar nuevo producto al carrito
      const newItem = {
        producto_id: currentProduct.id,
        nombre: currentProduct.nombre,
        precio: currentProduct.precio,
        cantidad: cantidadNum,
        subtotal: cantidadNum * currentProduct.precio
      };
      
      setCarrito([...carrito, newItem]);
    }
    
    setModalVisible(false);
  };

  // Eliminar producto del carrito
  const removeFromCart = (index) => {
    const updatedCarrito = [...carrito];
    updatedCarrito.splice(index, 1);
    setCarrito(updatedCarrito);
  };

  // Calcular total de la venta
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  // Finalizar venta
  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un producto al carrito');
      return;
    }
    
    try {
      // Preparar datos de la venta
      const fechaActual = new Date().toISOString();
      const total = calcularTotal();
      
      // Validar datos antes de enviar
      if (!fechaActual) {
        Alert.alert('Error', 'La fecha es requerida');
        return;
      }
      
      if (total <= 0) {
        Alert.alert('Error', 'El total debe ser mayor a 0');
        return;
      }
      
      if (!carrito || carrito.length === 0) {
        Alert.alert('Error', 'Debes agregar al menos un producto');
        return;
      }
      
      const ventaData = {
        fecha: fechaActual,
        total: total,
        productos: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        }))
      };
      
      await createVenta(ventaData);
      
      Alert.alert(
        'Éxito',
        'Venta registrada correctamente',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setCarrito([]);
              loadProductos(); // Recargar productos para actualizar stock
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-primary pt-safe-top pb-4 px-5" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View className="container mx-auto">
          <Text className="text-white text-2xl font-bold">Nueva Venta</Text>
        </View>
      </View>
      
      <View className="container mx-auto flex-1">
        <View className="flex-row flex-1 h-full">
          {/* Left side - Products list */}
          <View className="w-1/2 p-4">
            <Text className="text-lg font-bold mb-2">Productos Disponibles</Text>
            
            {/* Search bar */}
            <View className="mb-3 bg-white rounded-lg border border-gray-300 flex-row items-center px-3 py-2">
              <Text className="text-gray-500 mr-2">🔍</Text>
              <TextInput
                className="flex-1"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text className="text-gray-500 font-bold">×</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={filteredProductos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card
                  title={item.nombre}
                  subtitle={`Stock: ${item.stock} unidades`}
                  value={`$${item.precio.toFixed(2)}`}
                  variant="primary"
                  className="mb-2"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2
                  }}
                >
                  <TouchableOpacity
                    className="bg-primary rounded-md py-1 px-2 mt-2"
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text className="text-white text-center">Agregar</Text>
                  </TouchableOpacity>
                </Card>
              )}
              refreshing={loading}
              onRefresh={loadProductos}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">
                  {loading ? 'Cargando productos...' : searchQuery.length > 0 ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </Text>
              }
            />
          </View>
          
          {/* Right side - Cart */}
          <View className="w-1/2 bg-white h-full" style={{
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2
          }}>
            <View className="p-4 flex-1 h-full">
              <Text className="text-lg font-bold mb-2">Carrito de Compra</Text>
              
              {carrito.length > 0 ? (
                <ScrollView className="mb-4 flex-1 ">
                  {carrito.map((item, index) => (
                    <View key={index} className="flex-row justify-between items-center border-b border-gray-200 py-2">
                      <View className="flex-1">
                        <Text className="font-medium">{item.nombre}</Text>
                        <Text className="text-sm text-gray-600">
                          {item.cantidad} x ${item.precio.toFixed(2)}
                        </Text>
                      </View>
                      <Text className="font-bold">${item.subtotal.toFixed(2)}</Text>
                      <TouchableOpacity
                        className="ml-2 bg-danger rounded-full w-6 h-6 items-center justify-center"
                        onPress={() => removeFromCart(index)}
                      >
                        <Text className="text-white font-bold">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="flex-1 justify-center">
                  <Text className="text-center text-gray-500">
                    No hay productos en el carrito
                  </Text>
                </View>
              )}
              
              <View className="border-t border-gray-300 pt-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-bold">Total:</Text>
                  <Text className="font-bold text-xl">${calcularTotal().toFixed(2)}</Text>
                </View>
                
                <Button
                  variant="primary"
                  label="Finalizar Venta"
                  size="lg"
                  className="w-full"
                  onPress={finalizarVenta}
                  disabled={carrito.length === 0}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Modal para agregar producto al carrito */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[90%] rounded-xl p-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5
          }}>
            <Text className="text-2xl font-bold mb-4 text-center">
              Agregar al Carrito
            </Text>
            
            {currentProduct && (
              <View className="mb-4">
                <Text className="text-lg font-medium">{currentProduct.nombre}</Text>
                <Text className="text-gray-600">Precio: ${currentProduct.precio.toFixed(2)}</Text>
                <Text className="text-gray-600">Stock disponible: {currentProduct.stock}</Text>
              </View>
            )}
            
            <View className="mb-6">
              <Text className="text-gray-700 mb-1">Cantidad:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={cantidad}
                onChangeText={setCantidad}
                placeholder="1"
                keyboardType="number-pad"
              />
            </View>
            
            <View className="flex-row justify-end">
              <Button
                variant="secondary"
                label="Cancelar"
                size="md"
                className="mr-3"
                onPress={() => setModalVisible(false)}
              />
              <Button
                variant="primary"
                label="Agregar"
                size="md"
                onPress={addProductToCart}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SalesScreen;