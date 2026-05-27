import { createBrowserRouter } from 'react-router-dom';

import { ArticlePage } from '@/pages/ArticlePage';
import { ArticlesPage } from '@/pages/ArticlesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectLoadingPage } from '@/pages/ProjectLoadingPage';
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'load', element: <ProjectLoadingPage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'saved/:resId', element: <ResearchPage mode="saved" /> },
      { path: 'research/:resId', element: <ResearchPage mode="new" /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/:articleId', element: <ArticlePage /> },
    ],
  },
]);
