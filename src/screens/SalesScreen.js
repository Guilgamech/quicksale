import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Modal, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import Card from '../components/Card';
import { getProductos } from '../database/productos';
import { createVenta } from '../database/ventas';
import styles from './styles/SalesScreenStyles';

const SalesScreen = () => {
  const router = useRouter();
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

  // Update any navigation.navigate calls to router.push
  // For example:
  // const goToHome = () => {
  //   router.push('/');
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nueva Venta</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.twoColumnLayout}>
          {/* Left side - Products list */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>Productos Disponibles</Text>
            
            {/* Search bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>×</Text>
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
                  style={styles.productCard}
                >
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.addToCartText}>Agregar</Text>
                  </TouchableOpacity>
                </Card>
              )}
              refreshing={loading}
              onRefresh={loadProductos}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {loading ? 'Cargando productos...' : searchQuery.length > 0 ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </Text>
              }
            />
          </View>
          
          {/* Right side - Cart */}
          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>Carrito de Compra</Text>
            
            <View style={styles.cartContainer}>
              {carrito.length > 0 ? (
                <ScrollView style={styles.cartScroll}>
                  {carrito.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.nombre}</Text>
                        <Text style={styles.cartItemDetails}>
                          {item.cantidad} x ${item.precio.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.cartItemActions}>
                        <Text style={styles.cartItemSubtotal}>
                          ${item.subtotal.toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeFromCart(index)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>
                    El carrito está vacío
                  </Text>
                  <Text style={styles.emptyCartSubtext}>
                    Agrega productos desde la lista
                  </Text>
                </View>
              )}
              
              <View style={styles.cartFooter}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    ${calcularTotal().toFixed(2)}
                  </Text>
                </View>
                
                <Button
                  variant="success"
                  label="Finalizar Venta"
                  size="lg"
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Agregar al Carrito
            </Text>
            
            {currentProduct && (
              <View style={styles.modalProductInfo}>
                <Text style={styles.modalProductName}>{currentProduct.nombre}</Text>
                <Text style={styles.modalProductPrice}>
                  Precio: ${currentProduct.precio.toFixed(2)}
                </Text>
                <Text style={styles.modalProductStock}>
                  Stock disponible: {currentProduct.stock}
                </Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cantidad:</Text>
              <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="number-pad"
                placeholder="1"
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
                label="Agregar"
                size="md"
                style={styles.modalButton}
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