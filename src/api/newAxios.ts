import router from '../router'

import axios from 'axios';
const newAxios = axios.create({
  timeout: 1000
});
newAxios.interceptors.request.use(
  function(config) {
    const tok = localStorage.getItem('token');
    config.headers.Authorization = `Bearer ${tok}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

newAxios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response.status === 401) {
        router.push('/login');
      return Promise.resolve({ data: '登录失效，请重新登录' });
      //throw error; // 抛出错误，触发全局错误处理
    }
    return Promise.reject(error);
  }
);

export default newAxios;