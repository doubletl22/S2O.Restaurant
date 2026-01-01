// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 👈 1. Import hook điều hướng
import { COLORS } from '../../constants/colors';

// 👇 2. Import đúng tên biến MOCK_RESTAURANTS
import { MOCK_RESTAURANTS } from '../../data/mockData';

const HomeScreen = () => {
  const navigation = useNavigation(); // 👈 3. Khởi tạo navigation

  // Hàm xử lý khi bấm vào nhà hàng
  const handlePress = (item: any) => {
    // @ts-ignore
    navigation.navigate('RestaurantDetail', { restaurant: item });
  };

  // Banner AI Gợi ý
  const renderAiSuggestion = () => {
    const suggestedRestaurant = MOCK_RESTAURANTS[0]; // Lấy nhà hàng đầu tiên làm mẫu

    return (
      <View style={styles.aiCard}>
        <View style={{backgroundColor: COLORS.secondary, padding: 5, borderRadius: 5, alignSelf: 'flex-start'}}>
          <Text style={{fontSize: 10, fontWeight: 'bold'}}>✨ AI SUGGESTION</Text>
        </View>
        <Text style={{marginVertical: 5}}>Trời đang mưa, {suggestedRestaurant.name} có món lẩu ngon tuyệt!</Text>

        <TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={() => handlePress(suggestedRestaurant)}
        >
          <Image
            source={suggestedRestaurant.image} // 👈 Sửa lại cách gọi ảnh
            style={{width: 50, height: 50, borderRadius: 5}}
          />
          <View style={{marginLeft: 10}}>
             <Text style={{fontWeight: 'bold'}}>{suggestedRestaurant.name}</Text>
             <Text style={{color: COLORS.primary}}>Đặt ngay ➔</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Khám phá nhà hàng</Text>
        <Text style={{fontSize: 12, color: 'gray'}}>TP. Hồ Chí Minh 📍</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
            <Text style={{color: 'gray'}}>🔍 Tìm nhà hàng, món ăn...</Text>
        </View>

        {renderAiSuggestion()}

        <Text style={styles.sectionTitle}>Nhà hàng nổi bật</Text>

        {/* Render danh sách nhà hàng */}
        {MOCK_RESTAURANTS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.restCard}
              onPress={() => handlePress(item)} // 👈 Thêm sự kiện bấm vào đây
            >
                <Image
                  source={item.image} // 👈 Sửa lại cách gọi ảnh cho đúng format
                  style={styles.restImage}
                />
                <View style={{padding: 10}}>
                    <Text style={styles.restName}>{item.name}</Text>
                    <Text style={{color: 'gray'}}>{item.address}</Text>
                    <Text style={{color: COLORS.secondary}}>★ {item.rating} • {item.distance}</Text>
                </View>
            </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { padding: 20, paddingBottom: 0 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  searchBar: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 20 },
  aiCard: { backgroundColor: '#FFF8E1', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: COLORS.secondary },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  restCard: { backgroundColor: 'white', marginBottom: 15, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
  restImage: { width: '100%', height: 150, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  restName: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
});

export default HomeScreen;