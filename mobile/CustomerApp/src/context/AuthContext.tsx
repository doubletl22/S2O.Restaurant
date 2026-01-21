import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';

interface AuthContextType {
  userToken: string | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  // 👇 CẤU HÌNH ĐỊA CHỈ SERVER (QUAN TRỌNG)
  // Nếu là Android Emulator thì dùng 10.0.2.2, còn lại dùng localhost
  // Port 5201 là port backend đang chạy trên máy bạn
  const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5201' : 'http://localhost:5201';

const login = async (email: string, pass: string) => {
    try {
      console.log(`🚀 Đang gửi yêu cầu tới: ${BASE_URL}/api/auth/login`);

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass }),
      });

      const data = await response.json();
      console.log("🟢 SERVER TRẢ VỀ:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // 👇 SỬA Ở ĐÂY: Thêm data.value
      const myToken = data.value || data.token || data.accessToken;

      if (myToken) {
        console.log("✅ Đã lấy được Token!");
        setUserToken(myToken);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy Token trong phản hồi của Server");
      }

    } catch (error: any) {
      console.error("🔴 Lỗi Login:", error);
      Alert.alert("Đăng nhập thất bại", error.message);
    }
  };

  const logout = () => {
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};