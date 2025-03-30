import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import { getVentas } from '../database/ventas';
import { getProductos } from '../database/productos';
import { Image } from 'react-native';

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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with logo */}
      <View className="bg-primary pt-safe-top pb-4 px-5" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View className="container mx-auto flex-row items-center">
          <Image 
            source={require('../../assets/quicksale-in-app-logo.png')} 
            style={{ width: 30, height: 30 }}
            className="mr-2"
          />
          <Text className="text-white text-2xl font-bold">QuickSales</Text>
        </View>
      </View>
      
      <ScrollView className="flex-1">
        <View className="container mx-auto px-5 py-6">
    
          {/* Stats Cards */}
          <Text className="text-xl font-bold text-gray-800 mb-4 px-2">Estadísticas</Text>
          <View className="flex-row flex-wrap justify-between mb-8">
            <View className="w-[48%] bg-white rounded-card p-5 mb-4 border-l-4 border-l-primary" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <Text className="text-primary font-bold mb-1">Ventas</Text>
              <Text className="text-3xl font-bold">{stats.ventas}</Text>
            </View>
            
            <View className="w-[48%] bg-white rounded-card p-5 mb-4 border-l-4 border-l-success" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <Text className="text-success font-bold mb-1">Ingresos</Text>
              <Text className="text-3xl font-bold">${stats.ingresos.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              className="w-[48%] bg-white rounded-card p-5 mb-4 border-l-4 border-l-accent"
              onPress={() => navigation.navigate('Products')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2
              }}
            >
              <Text className="text-accent font-bold mb-1">Productos</Text>
              <Text className="text-3xl font-bold">{stats.productos}</Text>
            </TouchableOpacity>
            
            <View className="w-[48%] bg-white rounded-card p-5 mb-4 border-l-4 border-l-warning" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <Text className="text-warning font-bold mb-1">Stock Bajo</Text>
              <Text className="text-3xl font-bold">{stats.pendientes}</Text>
            </View>
          </View>
          
          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4 px-2">Acciones rápidas</Text>
            
            <View className="bg-white rounded-card p-6" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 5
            }}>
              <Button 
                variant="primary" 
                label="Nueva venta" 
                size="lg"
                className="w-full mb-4"
                onPress={() => navigation.navigate('Sales')}
              />
              
              <Button 
                variant="accent" 
                label="Gestionar inventario" 
                size="lg"
                className="w-full mb-4"
                onPress={() => navigation.navigate('Products')}
              />
              
              <Button 
                variant="success" 
                label="Ver estadísticas" 
                size="lg"
                className="w-full mb-4"
                onPress={() => navigation.navigate('Reports')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;