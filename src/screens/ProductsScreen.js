import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Modal, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import Card from '../components/Card';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../database/productos';
import styles from './styles/ProductsScreenStyles';

const ProductsScreen = () => {
  const router = useRouter();
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

  // Update any navigation.navigate calls to router.push
  // For example:
  // const goBack = () => {
  //   router.push('/');
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestionar Inventario</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Lista de Productos</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>+</Text>
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
              style={styles.productCard}
            >
              <View style={styles.buttonContainer}>
                <Button
                  variant="secondary"
                  label="Editar"
                  size="md"
                  style={styles.editButton}
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Cargando productos...' : 'No hay productos disponibles'}
              </Text>
              {!loading && (
                <Button
                  variant="primary"
                  label="Agregar primer producto"
                  size="lg"
                  style={styles.emptyButton}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                placeholder="Nombre del producto"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Precio:</Text>
              <TextInput
                style={styles.input}
                value={formData.precio}
                onChangeText={(text) => handleChange('precio', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Stock:</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => handleChange('stock', text)}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                label="Cancelar"
                size="md"
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              />
              <Button
                variant="primary"
                label="Guardar"
                size="md"
                style={styles.modalButton}
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