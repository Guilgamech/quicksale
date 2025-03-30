// Configuración del estado global con Zustand
import { create } from 'zustand';

// Store de ejemplo
export const useStore = create((set) => ({
  // Estado inicial
  count: 0,
  // Acciones
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));