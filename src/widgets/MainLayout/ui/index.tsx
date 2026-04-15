import { Outlet, useMatch } from 'react-router-dom';

import { useMe } from '@/entities/user';
import { Header } from '@/widgets/Header';

import './main-layout.scss';

export const MainLayout = () => {
  useMe();
  const isChatPage = useMatch('/chat/:chatId');
  const isChatsListPage = useMatch('/chats');

  return (
    <div className="main-layout">
      <Header />
      <main
        className={`main-layout__main${isChatPage || isChatsListPage ? ' main-layout__main--no-padding' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  );
};
