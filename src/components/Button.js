import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';

/**
 * Componente Button personalizado con estilos nativos
 * @param {object} props - Propiedades del componente
 * @param {string} props.variant - Variante del botón (primary, secondary, accent, danger, success)
 * @param {string} props.size - Tamaño del botón (sm, md, lg)
 * @param {function} props.onPress - Función a ejecutar al presionar
 * @param {string} props.label - Texto del botón
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {object} props.style - Estilos adicionales
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  onPress,
  label,
  disabled = false,
  style = {},
}) => {
  // Colores según variante - actualizado con la nueva paleta
  const variantColors = {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    danger: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
  };

  // Tamaños de padding según tamaño
  const sizePadding = {
    sm: { paddingVertical: 6, paddingHorizontal: 12 },
    md: { paddingVertical: 10, paddingHorizontal: 16 },
    lg: { paddingVertical: 12, paddingHorizontal: 24 },
  };
  
  // Tamaños de texto según tamaño
  const textSize = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: variantColors[variant] },
        sizePadding[size],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        { fontSize: textSize[size] }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  }
});

export default Button;