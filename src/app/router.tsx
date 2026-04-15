import { createBrowserRouter } from 'react-router-dom';

import { DemoPage } from '@/pages/DemoPage';
import { HomePage } from '@/pages/HomePage';
import { MainLayout } from '@/widgets/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'demo', element: <DemoPage /> },
    ],
  },
]);

//пример разных layout:
// {
//   // Страницы с MainHeader (для авторизованных)
//   element: <MainLayout />,
//   children: [
//     { path: '/', element: <HomePage /> },
//     { path: '/chat/:id', element: <ChatPage /> },
//   ],
// },
// {
//   // Страницы с AuthHeader (логин/регистрация)
//   element: <AuthLayout />,
//   children: [
//     { path: '/login', element: <LoginPage /> },
//     { path: '/register', element: <RegisterPage /> },
//   ],
// },
