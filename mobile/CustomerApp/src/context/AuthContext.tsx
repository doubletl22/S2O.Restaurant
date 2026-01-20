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


 const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5201' : 'http://localhost:5201';

  const login = async (email: string, pass: string) => {
    try {
      console.log(`Dang ket noi toi: ${BASE_URL}/api/auth/login`);

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: pass,
        }),
      });

      if (!response.ok) {
        // Nếu server trả về lỗi (400, 401, 500...)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      // Giả sử server trả về { token: "..." }
      setUserToken(data.token);

    } catch (error: any) {
      console.error("Lỗi Login:", error);
      // Nếu vẫn lỗi mạng, fallback về token ảo để bạn test tiếp giao diện
      Alert.alert("Lỗi mạng", "Không kết nối được Server. Đang dùng chế độ Offline để test.");
      setUserToken('token_ao_de_test_giao_dien');
    }
  };

  const logout = () => setUserToken(null);

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