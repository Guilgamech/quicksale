import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import { getVentas } from '../database/ventas';
import { getProductos } from '../database/productos';
import styles from './styles/HomeScreenStyles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    ventas: 0,
    ingresos: 0,
    productos: 0,
    pendientes: 0
  });
  
  // Cargar estadísticas cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
      return () => {};
    }, [])
  );
  
  // Función para cargar estadísticas desde la base de datos
  const loadStats = async () => {
    try {
      // Obtener ventas
      const ventas = await getVentas();
      const totalVentas = ventas.length;
      const totalIngresos = ventas.reduce((sum, venta) => sum + venta.total, 0);
      
      // Obtener productos
      const productos = await getProductos();
      const totalProductos = productos.length;
      
      // Calcular pendientes (productos con stock bajo)
      const pendientes = productos.filter(producto => producto.stock < 5).length;
      
      // Actualizar estadísticas
      setStats({
        ventas: totalVentas,
        ingresos: totalIngresos,
        productos: totalProductos,
        pendientes: pendientes
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/quicksale-in-app-logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>QuickSale</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
    
          {/* Stats Cards */}
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.primaryBorder]}>
              <Text style={[styles.statLabel, styles.primaryText]}>Ventas</Text>
              <Text style={styles.statValue}>{stats.ventas}</Text>
            </View>
            
            <View style={[styles.statCard, styles.successBorder]}>
              <Text style={[styles.statLabel, styles.successText]}>Ingresos</Text>
              <Text style={styles.statValue}>${stats.ingresos.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.statCard, styles.accentBorder]}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={[styles.statLabel, styles.accentText]}>Productos</Text>
              <Text style={styles.statValue}>{stats.productos}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, styles.warningBorder]}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={[styles.statLabel, styles.warningText]}>Stock Bajo</Text>
              <Text style={styles.statValue}>{stats.pendientes}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsContainer}>
            <Button
              variant="primary"
              label="Nueva Venta"
              size="lg"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Sales')}
            />
            
            <Button
              variant="accent"
              label="Gestionar Inventario"
              size="lg"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Products')}
            />
            
            <Button
              variant="secondary"
              label="Ver Reportes"
              size="lg"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;