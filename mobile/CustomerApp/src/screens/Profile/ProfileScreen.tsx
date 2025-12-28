import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Gọi nút đăng xuất

const ProfileScreen = () => {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text>👤 Trang cá nhân</Text>
      <TouchableOpacity onPress={logout} style={{marginTop: 20, padding: 10, backgroundColor: 'red'}}>
        <Text style={{color: 'white'}}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default ProfileScreen;