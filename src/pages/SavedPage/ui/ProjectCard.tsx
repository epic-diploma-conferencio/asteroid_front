import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { SavedProject } from './mock-projects';

interface Props {
  project: SavedProject;
  onDelete: (project: SavedProject) => void;
}

const ownerLabel = (project: SavedProject) =>
  project.ownerIsMe ? `Вы (${project.ownerEmail})` : project.ownerEmail;

export const ProjectCard = ({ project, onDelete }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="saved-card">
      <div className="saved-card__preview">
        <img src={project.preview} alt="" loading="lazy" />
      </div>

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
            <span className="saved-card__meta-item">{project.createdAt}</span>
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
