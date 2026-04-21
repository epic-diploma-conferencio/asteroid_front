import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, MessageSquare, Settings, User2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLogoutUser } from '@/features/authorization';
import './account-dropdown.scss';

interface DropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountDropdown = ({ open, onOpenChange }: DropdownProps) => {
  const { mutate: logout } = useLogoutUser();
  const navigate = useNavigate();
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="Header__profile-trigger" aria-label="Открыть меню профиля">
          <span>Профиль</span>
          <ChevronDown size={16} strokeWidth={2.4} className="Header__profile-trigger-chevron" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="dropdown" side="bottom" align="end" sideOffset={14}>
        <DropdownMenu.Item className="dropdown__item" onClick={() => {}}>
          <User2Icon />
          Профиль
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="dropdown__separator" />
        <DropdownMenu.Item className="dropdown__item" onClick={() => navigate('/chats')}>
          <MessageSquare />
          Чаты
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="dropdown__separator" />
        <DropdownMenu.Item className="dropdown__item" onClick={() => {}}>
          <Settings />
          Настройки
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="dropdown__separator" />
        <DropdownMenu.Item
          className="dropdown__item dropdown__item--danger"
          onClick={() => logout()}
        >
          <LogOut />
          Выйти
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
