import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

// 👇 Code nút bấm tự chế (Không cần file MyButton bên ngoài nữa)
const CustomButton = ({ title, onPress }: { title: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const BookingScreen = () => {
  const { userToken } = useAuth();

  const [note, setNote] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [guestName, setGuestName] = useState('Khách Hàng');
  const [phone, setPhone] = useState('0909000111');

  const handleBooking = async () => {
    try {
      // 👇 ĐƯỜNG DẪN API CHUẨN THEO SWAGGER CỦA BẠN (Bookings số nhiều)
      const BOOKING_API_URL = 'http://10.0.2.2:5265/api/Bookings';

      // BranchId giả định (lấy từ database của bạn)
      const demoBranchId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      const payload = {
        branchId: demoBranchId,
        tableId: null,
        guestName: guestName,
        phoneNumber: phone,
        bookingTime: new Date().toISOString(),
        partySize: parseInt(partySize) || 2,
        note: note
      };

      console.log("🚀 Đang gửi đặt bàn:", JSON.stringify(payload, null, 2));

      const response = await fetch(BOOKING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("✅ Thành công", "Đơn đặt bàn của bạn đã được gửi!");
        setNote('');
      } else {
        const data = await response.json();
        console.log("🔴 Lỗi Server:", data);
        Alert.alert("❌ Thất bại", "Lỗi: " + (data.title || "Chi nhánh hoặc dữ liệu không hợp lệ"));
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Lỗi Mạng", "Không kết nối được Booking Service (5265).");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ĐẶT BÀN</Text>

        <Text style={styles.label}>Tên của bạn:</Text>
        <TextInput style={styles.input} value={guestName} onChangeText={setGuestName} />

        <Text style={styles.label}>Số điện thoại:</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>

        <Text style={styles.label}>Số người:</Text>
        <TextInput style={styles.input} value={partySize} onChangeText={setPartySize} keyboardType="numeric"/>

        <Text style={styles.label}>Ghi chú:</Text>
        <TextInput
          style={styles.inputArea} value={note} onChangeText={setNote}
          placeholder="VD: Cần ghế trẻ em..." multiline numberOfLines={3}
        />

        <View style={{marginTop: 20}}>
            {/* 👇 Dùng nút bấm nội bộ, không lo lỗi import */}
            <CustomButton title="XÁC NHẬN ĐẶT BÀN" onPress={handleBooking} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  inputArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#f9f9f9', height: 80, textAlignVertical: 'top' },
  // 👇 Style cho nút bấm mới
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default BookingScreen;