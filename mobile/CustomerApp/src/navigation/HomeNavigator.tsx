// src/navigation/HomeNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Import màn hình chính
import HomeScreen from '../screens/Home/HomeScreen';

// 👇 2. QUAN TRỌNG: Import màn hình chi tiết (Kiểm tra đúng tên file của bạn)
import RestaurantDetailScreen from '../screens/Home/RestaurantDetailScreen';

const HomeStack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator>
      {/* Màn hình danh sách */}
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      {/* 👇 3. Đăng ký màn hình chi tiết vào đây */}
      {/* "name" phải khớp đúng với tên bạn gọi trong lệnh navigation.navigate('...') */}
      <HomeStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Chi tiết nhà hàng' }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;