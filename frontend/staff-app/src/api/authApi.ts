import axiosClient from './axiosClient'; // File cấu hình axios ở bước trước

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // Backend trả về { "token": "..." } hoặc chuỗi raw tùy cấu hình
  // Nếu AuthController của bạn trả về { value: "token..." } thì sửa lại tương ứng
}

export const authApi = {
  login: async (data: LoginCommand) => {
    // Gọi vào endpoint: [HttpPost("login")] trong AuthController
    const response = await axiosClient.post('/auth/login', data);
    return response.data;
  }
};