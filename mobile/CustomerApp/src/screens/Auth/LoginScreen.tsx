// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert ,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Hook để chuyển trang

// Import các "viên gạch" component
import { COLORS } from '../../constants/colors';
import MyButton from '../../components/MyButton';
import MyInput from '../../components/MyInput';

const LoginScreen = () => {
  const navigation = useNavigation<any>(); // Khai báo biến điều hướng
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 1. Validate đơn giản
    if (email === '' || password === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');
      return;
    }
    // 2. Giả lập đăng nhập thành công (Sau này sẽ gọi API ở đây)
    Alert.alert('Thành công', 'Đăng nhập OK!');
    // Sau khi OK thì chuyển sang màn hình chính (sẽ làm ở bước sau)
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo tượng trưng */}
        <View style={styles.header}>
            <Image
  source={require('../../assets/Logo.png')}
  style={styles.logoImage}
/>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        {/* Form nhập liệu */}
        <MyInput
            placeholder="Email / Số điện thoại"
            value={email}
            onChangeText={setEmail}
        />
        <MyInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true} // Ẩn password
        />

        <TouchableOpacity onPress={() => Alert.alert('Tính năng đang làm')}>
            <Text style={styles.forgotPass}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <MyButton title="ĐĂNG NHẬP" onPress={handleLogin} />

        {/* Chân trang */}
        <View style={styles.footer}>
            <Text>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Đăng ký ngay</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#971d0aff' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  icon: { fontSize: 50, marginBottom: 10 },
  logoImage: {
    width: 250,   // Chỉnh độ to nhỏ của logo tại đây
    height: 250,
    resizeMode: 'contain', // Giúp ảnh không bị méo
    marginBottom: -10,
    marginTop: -150,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 16, color: '#f0f0f0', marginTop: 5 },
  forgotPass: { alignSelf: 'flex-end', color: COLORS.white, marginVertical: 10, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: COLORS.white, fontWeight: 'bold' },
});

export default LoginScreen;