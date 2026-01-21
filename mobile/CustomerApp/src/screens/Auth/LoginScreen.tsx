import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import MyButton from '../../components/MyButton';
import MyInput from '../../components/MyInput';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');

    // 👇 SỬA LỖI TẠI ĐÂY: Truyền email và password vào hàm login
    login(email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
            <Image source={require('../../assets/Logo.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
        </View>
        <MyInput placeholder="Email" value={email} onChangeText={setEmail} />
        <MyInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
        <MyButton title="ĐĂNG NHẬP" onPress={handleLogin} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop: 20}}>
            <Text style={{color: 'white', textDecorationLine: 'underline'}}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 10 },
});
export default LoginScreen;