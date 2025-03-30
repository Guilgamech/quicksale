import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Modal, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../database/productos';

const ProductsScreen = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: ''
  });

  // Cargar productos al iniciar
  useEffect(() => {
    loadProductos();
  }, []);

  // Función para cargar productos desde la base de datos
  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear nuevo producto
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setFormData({ nombre: '', precio: '', stock: '' });
    setModalVisible(true);
  };

  // Abrir modal para editar producto existente
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio.toString(),
      stock: product.stock.toString()
    });
    setModalVisible(true);
  };

  // Manejar cambios en el formulario
  const handleChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Guardar producto (crear o actualizar)
  const handleSaveProduct = async () => {
    try {
      // Validar campos - Mejorar validación para nombre
      const nombreTrimmed = formData.nombre ? formData.nombre.trim() : '';
      if (!nombreTrimmed) {
        Alert.alert('Error', 'El nombre es obligatorio y no puede estar vacío');
        return;
      }

      const precio = parseFloat(formData.precio);
      if (isNaN(precio) || precio <= 0) {
        Alert.alert('Error', 'El precio debe ser un número mayor a 0');
        return;
      }

      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        Alert.alert('Error', 'El stock debe ser un número mayor o igual a 0');
        return;
      }

      const productoData = {
        nombre: nombreTrimmed,
        precio: precio,
        stock: stock
      };

      if (currentProduct) {
        // Actualizar producto existente
        await updateProducto(currentProduct.id, productoData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await createProducto(productoData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      setModalVisible(false);
      loadProductos(); // Recargar la lista
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Confirmar y eliminar producto
  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar el producto "${product.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProducto(product.id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              loadProductos(); // Recargar la lista
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with title */}
      <View className="bg-primary pt-safe-top pb-4 px-5" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View className="container mx-auto flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Gestionar Inventario</Text>
        </View>
      </View>
      
      <View className="container mx-auto px-5 py-6 flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">Lista de Productos</Text>
          <TouchableOpacity 
            className="bg-primary rounded-md items-center justify-center px-4 py-2"
            onPress={handleAddProduct}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4
            }}
          >
            <Text className="text-white text-xl font-bold">+</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card
              title={item.nombre}
              subtitle={`Stock: ${item.stock} unidades`}
              value={`$${item.precio.toFixed(2)}`}
              variant="primary"
              className="mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2
              }}
            >
              <View className="flex-row justify-end mt-3">
                <Button
                  variant="secondary"
                  label="Editar"
                  size="md"
                  className="mr-3"
                  onPress={() => handleEditProduct(item)}
                />
                <Button
                  variant="danger"
                  label="Eliminar"
                  size="md"
                  onPress={() => handleDeleteProduct(item)}
                />
              </View>
            </Card>
          )}
          refreshing={loading}
          onRefresh={loadProductos}
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-xl" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <Text className="text-center text-gray-500 py-4 text-lg">
                {loading ? 'Cargando productos...' : 'No hay productos disponibles'}
              </Text>
              {!loading && (
                <Button
                  variant="primary"
                  label="Agregar primer producto"
                  size="lg"
                  className="mt-3"
                  onPress={handleAddProduct}
                />
              )}
            </View>
          }
        />
      </View>

      {/* Modal para crear/editar producto */}
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
              {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Nombre:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                placeholder="Nombre del producto"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Precio:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={formData.precio}
                onChangeText={(text) => handleChange('precio', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-gray-700 mb-1">Stock:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={formData.stock}
                onChangeText={(text) => handleChange('stock', text)}
                placeholder="0"
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
                label="Guardar"
                size="md"
                onPress={handleSaveProduct}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductsScreen;