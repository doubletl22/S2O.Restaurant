// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './src/navigation/AuthNavigator'; // Gọi file vừa tạo

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
         {/* Tạm thời chạy AuthNavigator trước để test Login */}
        <AuthNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;