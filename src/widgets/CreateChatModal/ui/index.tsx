import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateOrGetDirectChat } from '@/entities/chat';
import type { SearchParams } from '@/entities/user';
import { useSearch } from '@/entities/user';
import { Modal } from '@/shared/ui/Modal';

import './create-chat-modal.scss';

interface CreateChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateChatModal = ({ open, onOpenChange }: CreateChatModalProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
    }
  }, [open]);

  const searchParams: SearchParams = debouncedSearch
    ? { login: debouncedSearch, size: 10, excludeMe: true }
    : {};

  const { data, isFetching } = useSearch(searchParams);
  const { mutate: createChat, isPending } = useCreateOrGetDirectChat();

  const handleSelectUser = (login: string) => {
    createChat(
      { peerLogin: login },
      {
        onSuccess: async (chat) => {
          await navigate(`/chat/${chat.chatId}`);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Новый чат"
      description="Найдите пользователя по логину"
    >
      <div className="create-chat-modal">
        <h2 className="create-chat-modal__title">Новый чат</h2>
        <input
          className="create-chat-modal__input"
          placeholder="Поиск по логину..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
        />
        <div className="create-chat-modal__results">
          {isFetching && <div className="create-chat-modal__hint">Поиск...</div>}
          {!isFetching && debouncedSearch && (data?.items.length ?? 0) === 0 && (
            <div className="create-chat-modal__hint">Пользователи не найдены</div>
          )}
          {!isFetching &&
            data?.items.map((user) => (
              <button
                key={user.login}
                className="create-chat-modal__user-item"
                onClick={() => handleSelectUser(user.login)}
                disabled={isPending}
              >
                <img
                  className="create-chat-modal__user-avatar"
                  src={
                    user.avatarUrl ??
                    `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff&bold=true&size=38`
                  }
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <div className="create-chat-modal__user-info">
                  <span className="create-chat-modal__user-name">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="create-chat-modal__user-login">@{user.login}</span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );
};
