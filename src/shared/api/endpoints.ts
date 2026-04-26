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
  users: {
    SEARCH: '/users',
    SEARCH_USER: '/users/',
  },
  research: {
    LIST: '/saved',
    CREATE: '/saved',
    DETAIL: (id: string) => `/saved/${id}`,
  },
  upload: {
    PROJECT: '/upload',
  },
  analysis: {
    RULES_AVAILABLE: '/rules/avaliable',
    START: '/startAnalysis',
  },
  articles: {
    LIST: '/articles',
    DETAIL: (articleId: string) => `/articles/${articleId}`,
  },
};
