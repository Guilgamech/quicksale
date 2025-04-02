import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getVentas } from '../database/ventas';
import Card from '../components/Card';
import Button from '../components/Button';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import styles from './styles/ReportsScreenStyles';

const ReportsScreen = () => {
  const router = useRouter();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  useEffect(() => {
    loadVentas();
  }, [selectedPeriod]);
  
  const loadVentas = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las ventas
      const allVentas = await getVentas();
      
      // Filtrar por período seleccionado
      const filteredVentas = filterVentasByPeriod(allVentas, selectedPeriod);
      
      // Ordenar por fecha (más reciente primero)
      const sortedVentas = filteredVentas.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      setVentas(sortedVentas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las ventas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterVentasByPeriod = (ventas, period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return ventas.filter(venta => {
          const ventaDate = new Date(venta.fecha);
          return ventaDate >= today;
        });
        
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return ventas.filter(venta => {
          const ventaDate = new Date(venta.fecha);
          return ventaDate >= weekStart;
        });
        
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return ventas.filter(venta => {
          const ventaDate = new Date(venta.fecha);
          return ventaDate >= monthStart;
        });
        
      case 'all':
      default:
        return ventas;
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const calculateTotalSales = () => {
    return ventas.reduce((sum, venta) => sum + venta.total, 0);
  };
  
  const exportToCSV = async () => {
    try {
      if (ventas.length === 0) {
        Alert.alert('Error', 'No hay ventas para exportar');
        return;
      }
      
      // Create CSV header
      let csvContent = 'ID,Fecha,Total\n';
      
      // Add data rows
      ventas.forEach(venta => {
        const formattedDate = formatDate(venta.fecha);
        csvContent += `${venta.id},"${formattedDate}",${venta.total.toFixed(2)}\n`;
      });
      
      // Generate filename with app name and current date
      const date = new Date();
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      const fileName = `QuickSale_Ventas_${formattedDate}.csv`;
      
      // Create file in cache directory
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, csvContent);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: `Compartir ${fileName}`,
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert('Error', 'El compartir archivos no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      Alert.alert('Error', 'No se pudo exportar a CSV: ' + error.message);
    }
  };
  
  const renderVentaItem = ({ item }) => (
    <Card
      title={`Venta #${item.id}`}
      subtitle={formatDate(item.fecha)}
      value={`$${item.total.toFixed(2)}`}
      variant="success"
      style={styles.ventaCard}
    />
  );
  
  // Update any navigation.navigate calls to router.push
  // For example:
  // const goToHome = () => {
  //   router.push('/');
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reportes de Ventas</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {/* Period selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'today' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('today')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'today' && styles.periodButtonTextActive
            ]}>
              Hoy
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.periodButtonTextActive
            ]}>
              Semana
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.periodButtonTextActive
            ]}>
              Mes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'all' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'all' && styles.periodButtonTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Summary card */}
        <Card
          title="Resumen de Ventas"
          subtitle={`Período: ${
            selectedPeriod === 'today' ? 'Hoy' :
            selectedPeriod === 'week' ? 'Esta semana' :
            selectedPeriod === 'month' ? 'Este mes' : 'Todas'
          }`}
          value={`$${calculateTotalSales().toFixed(2)}`}
          variant="primary"
          style={styles.summaryCard}
        >
          <Text style={styles.summaryText}>
            Total de ventas: {ventas.length}
          </Text>
          <Button 
            label="Exportar a CSV" 
            variant="accent" 
            size="sm"
            onPress={exportToCSV}
            style={styles.exportButton}
          />
        </Card>
        
        {/* Sales list */}
        <Text style={styles.sectionTitle}>Listado de Ventas</Text>
        
        <FlatList
          data={ventas}
          renderItem={renderVentaItem}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={loadVentas}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Cargando ventas...' : 'No hay ventas en este período'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;