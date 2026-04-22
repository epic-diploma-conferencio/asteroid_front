import { Outlet, useMatch } from 'react-router-dom';

import { useMe } from '@/entities/user';
import { Header } from '@/widgets/Header';

import './main-layout.scss';

export const MainLayout = () => {
  useMe();
  const isChatPage = useMatch('/chat/:chatId');
  const isChatsListPage = useMatch('/chats');
  const isWelcomePage = useMatch('/');
  const noPadding = isChatPage || isChatsListPage || isWelcomePage;

  return (
    <div className="main-layout">
      <Header />
      <main className={`main-layout__main${noPadding ? ' main-layout__main--no-padding' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};
