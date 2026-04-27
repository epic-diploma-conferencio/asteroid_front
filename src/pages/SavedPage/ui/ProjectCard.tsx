import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { SavedResearchListItem } from '@/entities/research';
import { formatCreatedAt } from '@/shared/lib/date/format-created-at';
import { Loader } from '@/shared/ui/Loader';

import './project-card.scss';

const ownerLabel = (project: SavedResearchListItem) =>
  project.ownerIsMe ? `Вы (${project.ownerEmail})` : project.ownerEmail;

interface Props {
  project: SavedResearchListItem;
  onDelete: (project: SavedResearchListItem) => void;
}

export const ProjectCard = ({ project, onDelete }: Props) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isProcessing = project.status === 'processing';
  const displayTitle = isProcessing ? 'Новое исследование' : project.name;

  return (
    <article className={`saved-card${isProcessing ? ' saved-card--processing' : ''}`}>
      {isProcessing ? (
        <div className="saved-card__preview-button" aria-hidden="true">
          <div className="saved-card__preview saved-card__preview--placeholder">
            <div className="saved-card__preview-skeleton" />
            <div className="saved-card__processing-loader">
              <Loader size="sm" />
            </div>
          </div>
        </div>
      ) : (
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
      )}

      <div className="saved-card__body">
        <div className="saved-card__text">
          <h3 className="saved-card__title">{displayTitle}</h3>
          <div className="saved-card__meta">
            {isProcessing ? (
              <span className="saved-card__meta-item saved-card__meta-item--processing">
                Выполняется анализ
                <span className="saved-card__ellipsis" aria-hidden="true">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </span>
            ) : (
              <>
                <Tooltip.Provider delayDuration={500}>
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
              </>
            )}
          </div>
        </div>

        {!isProcessing ? (
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
        ) : null}
      </div>
    </article>
  );
};
