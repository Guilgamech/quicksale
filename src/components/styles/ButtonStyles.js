import { StyleSheet } from 'react-native';

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
    marginVertical: 4,
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  }
});

export default styles;