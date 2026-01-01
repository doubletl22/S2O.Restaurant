// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 👇 QUAN TRỌNG: Import HomeNavigator từ file riêng (file mà bạn đã thêm chi tiết nhà hàng)
import HomeNavigator from './HomeNavigator';

import BookingScreen from '../screens/Booking/BookingScreen';
import ScanScreen from '../screens/QR/ScanScreen';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      {/* Tab Home sử dụng HomeNavigator đã được import */}
      <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Khám phá' }} />

      <Tab.Screen name="Booking" component={BookingScreen} options={{ title: 'Đặt bàn' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: '', tabBarLabel: () => null }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

// --- CẤU HÌNH STYLE (Giữ nguyên) ---
const screenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: '#9E9E9E',
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabLabel,
  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName = '';
    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
    else if (route.name === 'Booking') iconName = focused ? 'calendar' : 'calendar-outline';
    else if (route.name === 'Scan') return <ScanButton />;
    else if (route.name === 'Chatbot') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

    return <Ionicons name={iconName} size={size} color={color} />;
  },
});

const ScanButton = () => (
  <View style={styles.scanBtn}>
    <Ionicons name="qr-code" size={30} color="white" />
  </View>
);

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  scanBtn: {
    top: -25, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 8
  }
});

export default AppNavigator;