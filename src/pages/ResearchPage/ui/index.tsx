import { LayoutGroup } from 'framer-motion';
import { ArrowLeft, Check, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useCreateResearch,
  useDeleteResearch,
  useResearchDetail,
  useUpdateResearch,
  type ResearchCard,
} from '@/entities/research';
import { useAuthStore } from '@/features/authorization';
import { Button } from '@/shared/ui/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal/ui';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';
import { AuthModal, type AuthMode } from '@/widgets/AuthModal';

import { ASTTreeDetailScreen } from './ASTTreeDetailScreen';
import { DescriptionPopover } from './DescriptionPopover';
import { buildCardsFromResearch, researchCards as defaultCards } from './research-cards';
import { ResultCard } from './ResultCard';
import { SaveProjectModal, type SaveProjectValues } from './SaveProjectModal';

import './research-page.scss';

interface ResearchPageProps {
  mode: 'new' | 'saved';
}

export const ResearchPage = ({ mode }: ResearchPageProps) => {
  const navigate = useNavigate();
  const { resId } = useParams<{ resId: string }>();
  const isAuth = useAuthStore((state) => state.token !== null);
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);

  const isSaved = mode === 'saved';
  const { data: savedResearch, isLoading: detailLoading } = useResearchDetail(
    isSaved ? resId : undefined,
  );

  const { mutateAsync: createResearch } = useCreateResearch();
  const { mutateAsync: deleteResearch } = useDeleteResearch();
  const { mutateAsync: updateResearch } = useUpdateResearch(resId ?? '');

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [expandedCard, setExpandedCard] = useState<ResearchCard | null>(null);

  useEffect(() => {
    setExpandedCard(null);
  }, [resId, mode]);

  const cards: ResearchCard[] = isSaved
    ? savedResearch
      ? buildCardsFromResearch(savedResearch.cards)
      : []
    : defaultCards;

  const title = isSaved
    ? savedResearch?.name
      ? `Исследование: ${savedResearch.name}`
      : 'Сохраненное исследование'
    : 'Результаты исследования';

  const handleCardClick = (id: string) => {
    const target = cards.find((c) => c.id === id);
    if (target) {
      setExpandedCard(target);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      void navigate(-1);
      return;
    }

    void navigate(isSaved ? '/saved' : isAuth ? '/dashboard' : '/');
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    if (isSaved && resId) {
      try {
        await deleteResearch(resId);
        toast.success('Исследование удалено');
        await navigate('/saved');
      } catch {
        toast.error('Не удалось удалить исследование');
      }
      return;
    }
    await navigate('/saved');
  };

  const handleConfirmRegenerate = () => {
    setRegenerateOpen(false);
    // TODO: заново выбрать правила и запустить анализ
  };

  const handleSaveProject = async (values: SaveProjectValues) => {
    try {
      if (isSaved && resId) {
        await updateResearch({ name: values.name, description: values.comment || null });
        toast.success('Изменения сохранены');
      } else {
        const created = await createResearch({
          name: values.name,
          description: values.comment || null,
        });
        toast.success('Исследование сохранено');
        await navigate(`/saved/${created.id}`);
      }
    } catch {
      toast.error('Не удалось сохранить');
    }
  };

  const handlePrimaryClick = () => {
    if (!isAuth) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      toast.error('Требуется авторизация!', {
        description:
          'Войдите в аккаунт или создайте новый для того чтобы иметь возможность сохранять проекты!',
      });
      return;
    }
    setSaveOpen(true);
  };

  if (isSaved && detailLoading) {
    return <section className="research-page">{isRouteLoading ? null : <Loader block />}</section>;
  }

  if (isSaved && !savedResearch) {
    return (
      <section className="research-page">
        <p className="research-page__loading">Исследование не найдено.</p>
      </section>
    );
  }

  const isExpanded = expandedCard !== null;

  return (
    <section className={`research-page${isExpanded ? ' research-page--expanded' : ''}`}>
      <header className="research-page__header">
        <button type="button" className="research-page__back" onClick={handleGoBack}>
          <ArrowLeft size={18} strokeWidth={2} />
          Назад
        </button>
        <div className="research-page__heading">
          <h1 className="research-page__title t-h-40">{title}</h1>
          {isSaved && savedResearch ? (
            <DescriptionPopover description={savedResearch.description} />
          ) : null}
        </div>
      </header>

      <LayoutGroup id="research-cards">
        <div className="research-page__grid">
          {cards.map((card) => (
            <ResultCard
              key={card.id}
              card={card}
              onClick={handleCardClick}
              isHidden={expandedCard !== null && expandedCard.id !== card.id}
              isExpanding={expandedCard?.id === card.id}
            />
          ))}
        </div>

        {expandedCard ? (
          <ASTTreeDetailScreen
            key={expandedCard.id}
            card={expandedCard}
            onClose={() => setExpandedCard(null)}
          />
        ) : null}
      </LayoutGroup>

      <footer className="research-page__actions">
        <button
          type="button"
          className="research-action research-action--danger"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 size={18} strokeWidth={2} />
          <span>Удалить</span>
        </button>
        <button type="button" className="research-action" onClick={() => setRegenerateOpen(true)}>
          <RefreshCw size={18} strokeWidth={2} />
          <span>Перегенерировать</span>
        </button>
        <Button className="research-page__save" onClick={handlePrimaryClick}>
          {isSaved ? (
            <>
              <Pencil size={18} strokeWidth={2.5} />
              Редактировать
            </>
          ) : (
            <>
              <Check size={18} strokeWidth={2.5} />
              Сохранить
            </>
          )}
        </Button>
      </footer>

      <DeleteConfirmModal
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
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

      <SaveProjectModal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSave={handleSaveProject}
        mode={isSaved ? 'edit' : 'create'}
        initialValues={
          isSaved && savedResearch
            ? { name: savedResearch.name, comment: savedResearch.description ?? '' }
            : undefined
        }
      />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authModalMode}
        onModeChange={setAuthModalMode}
      />
    </section>
  );
};
