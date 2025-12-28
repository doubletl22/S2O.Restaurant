import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/Home/HomeScreen';
// Import tạm các màn hình phụ (Đảm bảo bạn đã tạo file rỗng cho chúng)
import BookingScreen from '../screens/Booking/BookingScreen';
import ScanScreen from '../screens/QR/ScanScreen';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused }) => {
          let icon = '';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Booking') icon = '📅';
          else if (route.name === 'Scan') icon = '📷'; // Điểm nhấn
          else if (route.name === 'Chatbot') icon = '🤖';
          else if (route.name === 'Profile') icon = '👤';

          // Làm nổi bật nút Scan ở giữa
          if (route.name === 'Scan') {
            return (
              <View style={{
                 top: -15, width: 50, height: 50, borderRadius: 25,
                 backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5
              }}>
                <Text style={{fontSize: 24}}>📷</Text>
              </View>
            );
          }
          return <Text style={{fontSize: 24, opacity: focused ? 1 : 0.5}}>{icon}</Text>;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Khám phá' }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ title: 'Đặt bàn' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: '' }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Trợ lý AI' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};
export default AppNavigator;