import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Text, View, ActivityIndicator, Alert, StyleSheet } from 'react-native';

// Import database initialization
import { initDatabase } from '../src/database';

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // Initialize database
        await initDatabase();
        
        // Short delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing app:", err);
        setError(err.message);
        setIsLoading(false);
        
        // Show error alert
        Alert.alert(
          "Error de Inicialización",
          "No se pudo inicializar la aplicación: " + err.message,
          [{ text: "OK" }]
        );
      }
    };

    setupApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Iniciando QuickSale...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2C3E50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: ({ canGoBack }) => (
            canGoBack ? (
              <Image 
                source={require('../assets/quicksale-in-app-logo.png')} 
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
            ) : (
              <Image 
                source={require('../assets/quicksale-in-app-logo.png')} 
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
            )
          ),
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "QuickSale",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="products" 
          options={{ 
            title: "Productos",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="sales" 
          options={{ 
            title: "Ventas",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="reports" 
          options={{ 
            title: "Reportes",
            headerShown: true 
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#ECF0F1'
  },
  loadingText: {
    marginTop: 20, 
    color: '#2C3E50'
  }
});