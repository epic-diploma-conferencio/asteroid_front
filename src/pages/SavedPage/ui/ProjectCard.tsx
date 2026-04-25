import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { SavedResearchListItem } from '@/entities/research';

const ownerLabel = (project: SavedResearchListItem) =>
  project.ownerIsMe ? `Вы (${project.ownerEmail})` : project.ownerEmail;

const formatCreatedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) {
    return 'сегодня';
  }
  if (days === 1) {
    return 'вчера';
  }
  if (days < 7) {
    return `${days} дн. назад`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks === 1) {
    return 'неделю назад';
  }
  if (weeks < 4) {
    return `${weeks} нед. назад`;
  }
  const months = Math.floor(days / 30);
  if (months === 1) {
    return 'месяц назад';
  }
  if (months < 12) {
    return `${months} мес. назад`;
  }
  return `${Math.floor(days / 365)} г. назад`;
};

interface Props {
  project: SavedResearchListItem;
  onDelete: (project: SavedResearchListItem) => void;
}

export const ProjectCard = ({ project, onDelete }: Props) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="saved-card">
      <button
        type="button"
        className="saved-card__preview-button"
        onClick={() => navigate(`/saved/${project.id}`)}
        aria-label={`Открыть исследование ${project.name}`}
      >
        <div className="saved-card__preview">
          <img src={project.preview} alt="" loading="lazy" />
        </div>
      </button>

      <div className="saved-card__body">
        <div className="saved-card__text">
          <h3 className="saved-card__title">{project.name}</h3>
          <div className="saved-card__meta">
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="saved-card__meta-item saved-card__meta-item--truncate">
                    {ownerLabel(project)}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="saved-tooltip" side="top" sideOffset={6}>
                    {ownerLabel(project)}
                    <Tooltip.Arrow className="saved-tooltip__arrow" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <span className="saved-card__meta-sep" aria-hidden="true">
              •
            </span>
            <span className="saved-card__meta-item">{project.language}</span>

            <span className="saved-card__meta-sep" aria-hidden="true">
              •
            </span>
            <span className="saved-card__meta-item">{formatCreatedAt(project.createdAt)}</span>
          </div>
        </div>

        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="saved-card__menu-trigger"
              aria-label="Действия над исследованием"
            >
              <Settings size={20} strokeWidth={2} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="dropdown saved-card__menu"
              side="top"
              align="end"
              sideOffset={8}
            >
              <DropdownMenu.Item
                className="dropdown__item dropdown__item--danger"
                onSelect={() => onDelete(project)}
              >
                <Trash2 />
                Удалить
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </article>
  );
};
