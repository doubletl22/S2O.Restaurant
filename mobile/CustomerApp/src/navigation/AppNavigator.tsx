// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native'; // Thêm StyleSheet
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import các màn hình...
import HomeScreen from '../screens/Home/HomeScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import ScanScreen from '../screens/QR/ScanScreen';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      // Gọi biến cấu hình từ bên dưới lên -> Code HTML nhìn rất sạch
      screenOptions={screenOptions}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Khám phá' }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ title: 'Đặt bàn' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: '', tabBarLabel: () => null }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

// --- PHẦN TÁCH BIỆT: CẤU HÌNH (Để xuống cuối file hoặc ra file riêng) ---
const screenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: '#9E9E9E',
  tabBarStyle: styles.tabBar, // Gọi style từ object styles
  tabBarLabelStyle: styles.tabLabel,

  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName = '';
    // ... (Giữ nguyên logic if else chọn icon) ...
    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
    else if (route.name === 'Booking') iconName = focused ? 'calendar' : 'calendar-outline';
    else if (route.name === 'Scan') return <ScanButton />; // Tách nút Scan ra component con
    else if (route.name === 'Chatbot') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

    // SỬA LỖI SIZE Ở ĐÂY: Dùng biến size
    return <Ionicons name={iconName} size={size} color={color} />;
  },
});

// Component con: Nút Scan (Tách ra cho gọn)
const ScanButton = () => (
  <View style={styles.scanBtn}>
    <Ionicons name="qr-code" size={30} color="white" />
  </View>
);

// Style Sheet (Tách biệt phần trang trí)
const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  scanBtn: {
    top: -25,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 8, elevation: 10
  }
});

export default AppNavigator;