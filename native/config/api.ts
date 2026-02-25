// API Configuration
// For Expo Go on physical device or simulator, use your computer's local IP
// Find your IP: 
//   macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//   Windows: ipconfig

// IMPORTANT: Update this IP address to match your computer's local IP
export const API_BASE_URL = 'http://10.19.224.139:8080';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    sendVerification: `${API_BASE_URL}/api/auth/send-verification`,
    verifyEmail: `${API_BASE_URL}/api/auth/verify-email`,
    checkVerification: `${API_BASE_URL}/api/auth/check-verification`,
    resendVerification: `${API_BASE_URL}/api/auth/resend-verification`,
  },
};
