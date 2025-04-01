import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles/CardStyles';

const Card = ({ 
  title, 
  subtitle, 
  value, 
  variant = 'primary', 
  children, 
  className = '', // Mantener para compatibilidad, pero no se usará
  style = {},
  contentStyle = {},
  titleStyle = {},
  valueStyle = {}
}) => {
  // Map variant to color
  const variantColors = {
    primary: '#2C3E50',
    secondary: '#34495E',
    success: '#27AE60',
    danger: '#E74C3C',
    warning: '#F39C12',
    accent: '#3498DB',
  };
  
  const color = variantColors[variant] || variantColors.primary;
  
  return (
    <View 
      style={[
        styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: color,
        }, 
        style
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {title && (
          <Text 
            style={[
              styles.title, 
              { color: color }, 
              titleStyle
            ]}
          >
            {title}
          </Text>
        )}
        
        {value && (
          <Text 
            style={[
              styles.value,
              valueStyle
            ]}
          >
            {value}
          </Text>
        )}
        
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        
        {children}
      </View>
    </View>
  );
};

export default Card;