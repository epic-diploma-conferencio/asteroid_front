export const endpoints = {
  auth: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  user: {
    ME: '/auth/me',
    UPLOAD_AVATAR: '/users/me/avatar',
  },
  research: {
    LIST: '/saved',
    CREATE: '/saved',
    DETAIL: (id: string) => `/saved/${id}`,
  },
  articles: {
    LIST: '/articles',
    DETAIL: (articleId: string) => `/articles/${articleId}`,
  },
};
