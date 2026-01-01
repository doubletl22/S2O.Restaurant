// src/screens/Home/RestaurantDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';

// (Không cần import PRODUCTS nữa vì ta dùng menu bên trong restaurant)

const RestaurantDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // Lấy dữ liệu nhà hàng được gửi từ màn hình Home
  const { restaurant } = route.params || {};

  // Phòng hờ trường hợp chưa có dữ liệu
  if (!restaurant) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        {/* 1. Ảnh bìa & Nút Back */}
        <View>
          {/* 👇 SỬA QUAN TRỌNG: source={restaurant.image} vì data đã là object {uri:...} */}
          <Image source={restaurant.image} style={styles.coverImage} />

          <View style={styles.overlay} />

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Thông tin chính */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.address}>📍 {restaurant.address}</Text>
          <View style={styles.ratingRow}>
            <Text style={{ color: '#FFD700', fontWeight:'bold' }}>★ {restaurant.rating}</Text>
            <Text style={{ color: 'gray', marginLeft: 10 }}>• {restaurant.distance} • 15-20 min</Text>
          </View>
        </View>

        {/* 3. Các nút hành động */}
        <View style={styles.actionRow}>
            <ActionButton icon="call" label="Gọi điện" />
            <ActionButton icon="map" label="Chỉ đường" />
            <ActionButton icon="share-social" label="Chia sẻ" />
        </View>

        {/* 4. Thực đơn (Menu) */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Thực đơn nổi bật</Text>

          {/* 👇 SỬA: Lấy menu từ chính nhà hàng đó (restaurant.menu) */}
          {restaurant.menu && restaurant.menu.length > 0 ? (
            restaurant.menu.map((item: any) => (
                <View key={item.id} style={styles.menuItem}>
                  {/* Ảnh món ăn */}
                  <Image source={item.image} style={styles.menuImage} />

                  <View style={{ flex: 1, marginLeft: 10, justifyContent: 'center' }}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    {/* Giả lập mô tả nếu chưa có */}
                    <Text style={styles.menuDesc} numberOfLines={2}>
                        {item.description || 'Món ăn đặc biệt được chế biến từ nguyên liệu tươi ngon.'}
                    </Text>
                    <Text style={styles.menuPrice}>{item.price.toLocaleString()}đ</Text>
                  </View>

                  <TouchableOpacity style={styles.addBtn}>
                      <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
            ))
          ) : (
             <Text style={{color: 'gray', fontStyle: 'italic'}}>Đang cập nhật thực đơn...</Text>
          )}

        </View>
      </ScrollView>

      {/* 5. Nút Đặt bàn (Dính ở đáy) */}
      <View style={styles.footer}>
        <TouchableOpacity
            style={styles.bookBtn}
            // Chuyển sang Tab Booking
            onPress={() => navigation.navigate('Booking' as never)}
        >
            <Text style={styles.bookText}>ĐẶT BÀN NGAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component con: Nút tròn tiện ích
const ActionButton = ({icon, label}: any) => (
    <View style={{alignItems: 'center'}}>
        <View style={styles.circleBtn}>
            <Ionicons name={icon} size={24} color={COLORS.primary} />
        </View>
        <Text style={{fontSize: 12, marginTop: 5, color: 'gray'}}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  coverImage: { width: '100%', height: 250 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  backBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },

  infoContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  address: { color: 'gray', marginTop: 5, fontSize: 14 },
  ratingRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
  circleBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },

  menuSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  menuItem: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'white', borderRadius: 10 },
  menuImage: { width: 80, height: 80, borderRadius: 10 },
  menuName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  menuDesc: { color: 'gray', fontSize: 12, marginTop: 2 },
  menuPrice: { color: COLORS.primary, fontWeight: 'bold', marginTop: 5 },
  addBtn: { backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee', elevation: 20 },
  bookBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  bookText: { color: 'white', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});

export default RestaurantDetailScreen;