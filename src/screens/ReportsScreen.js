import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Button, Card } from '../components';
import { getVentas } from '../database/ventas';

const ReportsScreen = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  
  // Cargar ventas al iniciar y cuando cambia la fecha
  useEffect(() => {
    loadVentas();
  }, [date]);

  // Función para cargar ventas desde la base de datos
  const loadVentas = async () => {
    try {
      setLoading(true);
      const allVentas = await getVentas();
      
      // Filtrar ventas por la fecha seleccionada
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const filteredVentas = allVentas.filter(venta => {
        const ventaDate = new Date(venta.fecha);
        return ventaDate >= startOfDay && ventaDate <= endOfDay;
      });
      
      setVentas(filteredVentas);
      
      // Calcular totales
      const numVentas = filteredVentas.length;
      const ingresos = filteredVentas.reduce((sum, venta) => sum + venta.total, 0);
      
      setTotalVentas(numVentas);
      setTotalIngresos(ingresos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las ventas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar selector de fecha
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Exportar ventas a CSV
  const exportToCSV = async () => {
    if (ventas.length === 0) {
      Alert.alert('Error', 'No hay ventas para exportar en la fecha seleccionada');
      return;
    }
    
    try {
      // Crear encabezados del CSV
      let csvContent = 'ID,Fecha,Total,Productos\n';
      
      // Agregar datos de ventas
      ventas.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleString('es-ES');
        
        // Formatear productos
        let productosStr = '';
        if (venta.productos && venta.productos.length > 0) {
          productosStr = venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ');
        } else {
          productosStr = 'Sin productos';
        }
        
        csvContent += `${venta.id},"${fecha}",${venta.total.toFixed(2)},"${productosStr}"\n`;
      });
      
      // Generar nombre de archivo con la fecha
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `ventas_${dateStr}.csv`;
      
      // Ruta del archivo
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Escribir archivo
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      // Compartir archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar Reporte de Ventas',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert('Error', 'El compartir archivos no está disponible en este dispositivo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el reporte: ' + error.message);
    }
  };

  // Renderizar cada venta
  const renderVentaItem = ({ item }) => (
    <Card
      title={`Venta #${item.id}`}
      subtitle={new Date(item.fecha).toLocaleString('es-ES')}
      value={`$${item.total.toFixed(2)}`}
      variant="primary"
      className="mb-3"
    />
  );

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
          <Text className="text-white text-2xl font-bold">Reportes</Text>
        </View>
      </View>
      
      <View className="container mx-auto px-4 py-6 flex-1">
        {/* Title section */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-800">Ventas del día</Text>
        </View>
        
        {/* Date and Export section */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="bg-secondary rounded-md py-2 px-4 flex-1 mr-2"
            onPress={showDatePickerModal}
          >
            <Text className="text-white text-center">{formatDate(date)}</Text>
          </TouchableOpacity>
          
          <Button
            variant="accent"
            label="Exportar"
            size="sm"
            className="flex-1"
            onPress={exportToCSV}
          />
        </View>
        
        {/* Stats cards - Side by side with proper spacing */}
        <View className="flex-row mb-6">
          <Card
            title="Total Ventas"
            value={totalVentas.toString()}
            variant="primary"
            className="flex-1 mr-3"
            style={{ 
              paddingVertical: 16,
              borderRadius: 12,
              borderLeftWidth: 6
            }}
            contentStyle={{ paddingVertical: 12 }}
          />
          
          <Card
            title="Ingresos"
            value={`$${totalIngresos.toFixed(2)}`}
            variant="success"
            className="flex-1"
            style={{ 
              paddingVertical: 16,
              borderRadius: 12,
              borderLeftWidth: 6
            }}
            contentStyle={{ paddingVertical: 12 }}
          />
        </View>
        
        <FlatList
          data={ventas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVentaItem}
          refreshing={loading}
          onRefresh={loadVentas}
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-xl" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <Text className="text-center text-gray-500 py-4 text-lg">
                {loading ? 'Cargando ventas...' : 'No hay ventas en la fecha seleccionada'}
              </Text>
            </View>
          }
        />
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default ReportsScreen;