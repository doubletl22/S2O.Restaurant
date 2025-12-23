// src/screens/Auth/RegisterScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const RegisterScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Màn hình Đăng Ký</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
        <Text style={{ color: COLORS.primary }}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};
export default RegisterScreen;