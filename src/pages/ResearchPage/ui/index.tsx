import { Check, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/features/authorization';
import { mockProjects, type SavedProject } from '@/pages/SavedPage/ui/mock-projects';
import { Button } from '@/shared/ui/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal/ui';
import { AuthModal, type AuthMode } from '@/widgets/AuthModal';

import { researchCards } from './research-cards';
import { ResultCard } from './ResultCard';
import { SaveProjectModal, type SaveProjectValues } from './SaveProjectModal';

import './research-page.scss';

export const ResearchPage = () => {
  const navigate = useNavigate();
  const isAuth = useAuthStore((state) => state.token !== null);

  const [projects, setProjects] = useState<SavedProject[]>(mockProjects);
  const [pendingDelete, setPendingDelete] = useState<SavedProject | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  const handleCardClick = (id: string) => {
    // TODO: открыть детальный просмотр раздела id
    void id;
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setProjects((list) => list.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
    await navigate('/saved');
  };

  const handleConfirmRegenerate = () => {
    setRegenerateOpen(false);
    // TODO: заново выбрать правила и запустить анализ
  };

  const handleSaveProject = (values: SaveProjectValues) => {
    // TODO: отправить исследование на сервер
    void values;
  };

  const handleSaveClick = () => {
    if (isAuth) {
      setSaveOpen(true);
      return;
    }

    setAuthModalMode('login');
    setAuthModalOpen(true);
    toast.error('Требуется авторизация!', {
      description:
        'Войдите в аккаунт или создайте новый для того чтобы иметь возможность сохранять проекты!',
    });
  };

  return (
    <section className="research-page">
      <header className="research-page__header">
        <h1 className="research-page__title t-h-40">Результаты исследования</h1>
      </header>

      <div className="research-page__grid">
        {researchCards.map((card) => (
          <ResultCard key={card.id} card={card} onClick={handleCardClick} />
        ))}
      </div>

      <footer className="research-page__actions">
        <button
          type="button"
          className="research-action research-action--danger"
          onClick={() => setPendingDelete(projects.find((project) => project.id === '1') ?? null)}
        >
          <Trash2 size={18} strokeWidth={2} />
          <span>Удалить</span>
        </button>
        <button type="button" className="research-action" onClick={() => setRegenerateOpen(true)}>
          <RefreshCw size={18} strokeWidth={2} />
          <span>Перегенерировать</span>
        </button>
        <Button className="research-page__save" onClick={handleSaveClick}>
          <Check size={18} strokeWidth={2.5} />
          Сохранить
        </Button>
      </footer>

      <DeleteConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmModal
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        onConfirm={handleConfirmRegenerate}
        title="Вы уверены что хотите перегенерировать исследование?"
        message="Вам будет предложено заново выбрать правила анализа. Результат предыдущей генерации анализа по этому проекту будет утерян. Продолжить?"
        confirmLabel="Перегенерировать"
        confirmVariant="dark"
      />

      <SaveProjectModal open={saveOpen} onOpenChange={setSaveOpen} onSave={handleSaveProject} />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authModalMode}
        onModeChange={setAuthModalMode}
      />
    </section>
  );
};
