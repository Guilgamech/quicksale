import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ 
  title, 
  subtitle, 
  value, 
  variant = 'primary', 
  children, 
  className = '', 
  style = {},
  contentStyle = {},
  titleStyle = {},
  valueStyle = {}
}) => {
  // Map variant to color
  const variantColors = {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    accent: '#8B5CF6',
  };
  
  const color = variantColors[variant] || variantColors.primary;
  
  return (
    <View 
      className={`bg-white rounded-xl overflow-hidden ${className}`}
      style={[{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }, style]}
    >
      <View className="p-4" style={contentStyle}>
        {title && (
          <Text 
            className="font-bold text-gray-700 mb-1" 
            style={[{ color: color }, titleStyle]}
          >
            {title}
          </Text>
        )}
        
        {value && (
          <Text 
            className="text-2xl font-bold text-gray-800" 
            style={valueStyle}
          >
            {value}
          </Text>
        )}
        
        {subtitle && (
          <Text className="text-gray-500 text-sm">
            {subtitle}
          </Text>
        )}
        
        {children}
      </View>
    </View>
  );
};

export default Card;