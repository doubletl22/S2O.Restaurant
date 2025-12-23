import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Nhận vào: placeholder (chữ mờ), secureTextEntry (ẩn mật khẩu)
const MyInput = ({ placeholder, secureTextEntry, value, onChangeText }: any) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: 15,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
});

export default MyInput;