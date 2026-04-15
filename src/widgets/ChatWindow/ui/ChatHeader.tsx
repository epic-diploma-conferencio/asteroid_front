import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { PublicUser } from '@/entities/user';

interface ChatHeaderProps {
  participant: PublicUser;
}

export const ChatHeader = ({ participant }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <button className="chat-header__back" onClick={() => navigate('/chats')} title="Назад">
        <ArrowLeft size={22} />
      </button>
      <div className="chat-header__avatar">
        {participant.avatarUrl ? (
          <img src={participant.avatarUrl} alt={participant.firstName} />
        ) : (
          <span>
            {participant.firstName[0]}
            {participant.lastName[0]}
          </span>
        )}
      </div>
      <div className="chat-header__info">
        <span className="chat-header__name">
          {participant.firstName} {participant.lastName}
        </span>
      </div>
    </div>
  );
};
