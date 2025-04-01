import { create } from 'zustand';

// Store para la aplicación QuickSale
export const useAppStore = create((set) => ({
  // Estado de la aplicación
  currentView: 'home',
  cartItems: [],
  
  // Acciones
  setCurrentView: (view) => set({ currentView: view }),
  
  // Acciones para el carrito
  addToCart: (product, quantity) => set((state) => ({
    cartItems: [...state.cartItems, { ...product, quantity }]
  })),
  
  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== productId)
  })),
  
  clearCart: () => set({ cartItems: [] }),
}));