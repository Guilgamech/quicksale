import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, ProductsScreen, SalesScreen, ReportsScreen } from './src/screens';
import { initDatabase } from './src/database/index';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('Base de datos inicializada correctamente'))
      .catch(error => console.error('Error al inicializar la base de datos:', error));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9FAFB' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
