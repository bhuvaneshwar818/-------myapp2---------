import axios from 'axios';

const API_URL = '/api/auth/';

const register = (userData) => {
  return axios.post(API_URL + 'signup', userData);
};

const login = (username, password) => {
  return axios
    .post(API_URL + 'signin', { username, password })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const ping = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return axios.post(API_URL + 'ping', null, { 
      headers: { Authorization: 'Bearer ' + user.token } 
    }).catch(e => {}); // Silent catch 
  }
};

const logout = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    axios.post(API_URL + 'logout', null, { 
      headers: { Authorization: 'Bearer ' + user.token } 
    }).catch(e => console.error(e)).finally(() => {
      localStorage.removeItem('user');
    });
  } else {
    localStorage.removeItem('user');
  }
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const forgotUsername = (email, phone, dob) => {
  return axios.post(API_URL + 'forgot-username', { email, phone, dob });
};

const forgotPassword = (username, email) => {
  return axios.post(API_URL + 'forgot-password', { username, email });
};

const verifyOtp = (email, otp) => {
  return axios.post(API_URL + 'verify-otp', null, { params: { email, otp } });
};

const resetPassword = (email, newPassword) => {
    return axios.post(API_URL + 'reset-password', { email, newPassword });
};

const sendSignupOtp = (email) => {
    return axios.post(API_URL + 'send-signup-otp', null, { params: { email } });
};

const changePassword = (oldPassword, newPassword) => {
    return axios.post('/api/users/change-password', null, {
        params: { oldPassword, newPassword },
        headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token }
    });
};

const AuthService = {
  register,
  login,
  logout,
  ping,
  getCurrentUser,
  forgotUsername,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  sendSignupOtp
};

export default AuthService;
