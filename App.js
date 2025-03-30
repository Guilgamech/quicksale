import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Text, View, ActivityIndicator, LogBox } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import SalesScreen from './src/screens/SalesScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Initialize database
import { initDatabase } from './src/database';

// Ignore specific warnings that might be causing issues
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Possible Unhandled Promise Rejection'
]);

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize app
  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize database with retry mechanism
        let retries = 3;
        while (retries > 0) {
          try {
            await initDatabase();
            break; // Success, exit the retry loop
          } catch (dbError) {
            console.error(`Database initialization attempt failed, ${retries} retries left:`, dbError);
            retries--;
            if (retries === 0) throw dbError;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Add a delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsReady(true);
      } catch (e) {
        console.error("Initialization error:", e);
        setError(e.message || "Unknown error during initialization");
      }
    };

    prepare();
  }, []);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECF0F1' }}>
          {error ? (
            <View style={{ padding: 20 }}>
              <Text style={{ color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
                Error initializing app:
              </Text>
              <Text style={{ color: 'red', fontSize: 14 }}>
                {error}
              </Text>
            </View>
          ) : (
            <>
              <ActivityIndicator size="large" color="#2C3E50" />
              <Text style={{ marginTop: 20, color: '#2C3E50' }}>Cargando QuickSale...</Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <NavigationContainer fallback={<ActivityIndicator color="#2C3E50" size="large" />}>
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
