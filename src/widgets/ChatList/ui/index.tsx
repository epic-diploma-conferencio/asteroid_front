import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUserChats } from '@/entities/chat/api/chat.queries';
import type { ChatSummary } from '@/entities/chat/model/chat.types';

import './chat-list.scss';

const formatTime = (date?: Date) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0]}${lastName[0]}`.toUpperCase();

const ChatItem = ({ chat, isActive }: { chat: ChatSummary; isActive: boolean }) => {
  const navigate = useNavigate();
  const { participant } = chat;

  return (
    <button
      className={`chat-list__item${isActive ? ' chat-list__item--active' : ''}`}
      onClick={() => navigate(`/chat/${chat.chatId}`)}
    >
      <div className="chat-list__avatar">
        {participant.avatarUrl ? (
          <img src={participant.avatarUrl} alt={participant.firstName} />
        ) : (
          <span>{getInitials(participant.firstName, participant.lastName)}</span>
        )}
      </div>
      <div className="chat-list__info">
        <div className="chat-list__row">
          <span className="chat-list__name">
            {participant.firstName} {participant.lastName}
          </span>
          <span className="chat-list__time">{formatTime(chat.lastMessageAt)}</span>
        </div>
        <span className="chat-list__preview">{chat.lastMessagePreview}</span>
      </div>
    </button>
  );
};

export const ChatList = ({ headerAction }: { headerAction?: ReactNode }) => {
  const { chatId } = useParams<{ chatId: string }>();
  const { data, isLoading } = useUserChats({ size: 20 });
  const chats = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <aside className="chat-list">
      <div className="chat-list__header">
        <span className="chat-list__title">Сообщения</span>
        {headerAction}
      </div>
      <div className="chat-list__scroll">
        {isLoading && <div className="chat-list__loading">Загрузка...</div>}
        {chats.map((chat) => (
          <ChatItem key={chat.chatId} chat={chat} isActive={chat.chatId === chatId} />
        ))}
      </div>
    </aside>
  );
};
