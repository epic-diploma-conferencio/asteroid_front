import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, MessageSquare, Settings, User2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLogoutUser } from '@/features/authorization';
import './account-dropdown.scss';
import './header.scss';

interface DropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountDropdown = ({ open, onOpenChange }: DropdownProps) => {
  const { mutate: logout } = useLogoutUser();
  const navigate = useNavigate();
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger className="dropdown-trigger">
        <ChevronDown strokeWidth={3} className="chevron" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="dropdown"
        side="bottom"
        align="end"
        sideOffset={12}
        alignOffset={-12}
      >
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
