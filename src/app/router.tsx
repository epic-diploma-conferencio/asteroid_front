import { createBrowserRouter } from 'react-router-dom';

import { DemoPage } from '@/pages/DemoPage';
import { ResearchPage } from '@/pages/ResearchPage';
import { SavedPage } from '@/pages/SavedPage';
import { WelcomePage } from '@/pages/WelcomePage';
import { MainLayout } from '@/widgets/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'saved/:resId', element: <ResearchPage mode="saved" /> },
      { path: 'research/:resId', element: <ResearchPage mode="new" /> },
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
