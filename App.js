import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Text, View, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import SalesScreen from './src/screens/SalesScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Import database initialization
import { initDatabase } from './src/database';

const Stack = createNativeStackNavigator();

export default function App() {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECF0F1' }}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={{ marginTop: 20, color: '#2C3E50' }}>Iniciando QuickSale...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2C3E50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeft: (props) => (
              props.canGoBack ? (
                <>
                  <Text style={{ color: '#fff' }}>{props.label}</Text>
                  <Image 
                    source={require('./assets/quicksale-in-app-logo.png')} 
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                </>
              ) : (
                <Image 
                  source={require('./assets/quicksale-in-app-logo.png')} 
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
              )
            ),
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="Products" 
            component={ProductsScreen} 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="Sales" 
            component={SalesScreen} 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ 
              headerShown: false 
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
