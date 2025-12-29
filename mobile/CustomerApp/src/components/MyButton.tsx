import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface MyButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

const MyButton = ({ title, onPress }: MyButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary, padding: 15, borderRadius: 8,
    alignItems: 'center', marginVertical: 10, width: '100%', elevation: 3
  },
  text: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
export default MyButton;