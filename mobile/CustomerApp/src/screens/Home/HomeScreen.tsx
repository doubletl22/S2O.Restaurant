import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- Import
import { COLORS } from '../../constants/colors';
import { RESTAURANTS } from '../../data/mockData';

const HomeScreen = () => {
  const navigation = useNavigation<any>(); // <--- Khai báo biến điều hướng

  // Banner AI Gợi ý
  const renderAiSuggestion = () => (
    <View style={styles.aiCard}>
      <View style={{backgroundColor: COLORS.secondary, padding: 5, borderRadius: 5, alignSelf: 'flex-start'}}>
        <Text style={{fontSize: 10, fontWeight: 'bold'}}>✨ AI SUGGESTION</Text>
      </View>
      <Text style={{marginVertical: 5}}>Trời đang mưa, The Six Premium có món lẩu ngon tuyệt!</Text>

      {/* Bấm vào gợi ý AI cũng nhảy sang trang chi tiết */}
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center'}}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurant: RESTAURANTS[0] })}
      >
        <Image source={{uri: RESTAURANTS[0].image}} style={{width: 50, height: 50, borderRadius: 5}}/>
        <View style={{marginLeft: 10}}>
            <Text style={{fontWeight: 'bold'}}>{RESTAURANTS[0].name}</Text>
            <Text style={{color: COLORS.primary}}>Đặt ngay ➔</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Khám phá nhà hàng</Text>
        <Text style={{fontSize: 12, color: 'gray'}}>TP. Hồ Chí Minh 📍</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.searchBar}>
            <Text style={{color: 'gray'}}>🔍 Tìm nhà hàng, món ăn...</Text>
        </View>

        {renderAiSuggestion()}

        <Text style={styles.sectionTitle}>Nhà hàng nổi bật</Text>

        {/* Danh sách nhà hàng */}
        {RESTAURANTS.map(item => (
            <TouchableOpacity
                key={item.id}
                style={styles.restCard}
                // <--- SỰ KIỆN QUAN TRỌNG: Bấm vào thì chuyển trang và gửi kèm dữ liệu item
                onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
            >
                <Image source={{uri: item.image}} style={styles.restImage}/>
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