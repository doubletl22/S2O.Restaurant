import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface MyInputProps extends TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

const MyInput = ({ placeholder, secureTextEntry = false, value, onChangeText, ...props }: MyInputProps) => {
  const [visible, setVisible] = useState(!secureTextEntry);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={!visible && secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(!visible)}>
            <Text>{visible ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray,
    borderRadius: 8, backgroundColor: COLORS.white, paddingHorizontal: 15, height: 50,
  },
  input: { flex: 1, color: COLORS.text, height: '100%' },
});
export default MyInput;