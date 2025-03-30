import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Text } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import SalesScreen from './src/screens/SalesScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Initialize database
import './src/database';

const Stack = createNativeStackNavigator();

export default function App() {
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
