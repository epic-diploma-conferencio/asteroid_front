import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useDeleteResearch,
  useResearchLongPolling,
  useResearchList,
  researchKeys,
  type SavedResearchListItem,
} from '@/entities/research';
import { Button } from '@/shared/ui/Button';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal/ui';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';

import { Pagination } from './Pagination';
import { ProjectCard } from './ProjectCard';
import './saved-page.scss';

const PAGE_SIZE = 3;

const pageVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 80 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -80 * dir }),
};

export const SavedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);
  const { data: projects = [], isLoading } = useResearchList();
  const { mutateAsync: deleteResearch } = useDeleteResearch();

  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SavedResearchListItem | null>(null);
  const [hasShownPendingError, setHasShownPendingError] = useState(false);

  const pendingState = (location.state as {
    pendingResearchId?: string;
    pendingResearchName?: string;
  } | null) ?? { pendingResearchId: undefined, pendingResearchName: undefined };

  const activePendingResearchId =
    pendingState.pendingResearchId ??
    projects.find((project) => project.status === 'processing')?.id ??
    undefined;
  const { data: pendingStatus, error: pendingStatusError } = useResearchLongPolling(
    activePendingResearchId,
    Boolean(activePendingResearchId),
  );

  const pendingFallbackProject = useMemo<SavedResearchListItem | null>(() => {
    if (!pendingState.pendingResearchId) {
      return null;
    }

    const normalizedName =
      pendingState.pendingResearchName?.replace(/\.zip$/i, '').trim() || 'Новое исследование';

    return {
      id: pendingState.pendingResearchId,
      name: normalizedName,
      description: null,
      ownerEmail: '',
      ownerIsMe: true,
      isSaved: false,
      language: 'TypeScript',
      createdAt: new Date().toISOString(),
      preview: '',
      status: 'processing',
    };
  }, [pendingState.pendingResearchId, pendingState.pendingResearchName]);

  const goToPage = (next: number) => {
    if (next === page) {
      return;
    }
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return projects.slice(start, start + PAGE_SIZE);
  }, [projects, currentPage]);

  useEffect(() => {
    if (!activePendingResearchId || pendingStatus?.status !== 'completed') {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: researchKeys.list() });
    void queryClient.invalidateQueries({ queryKey: researchKeys.detail(activePendingResearchId) });
    void queryClient.invalidateQueries({
      queryKey: researchKeys.publicDetail(activePendingResearchId),
    });
    void navigate(`/research/${activePendingResearchId}`, { replace: true });
  }, [activePendingResearchId, navigate, pendingStatus?.status, queryClient]);

  useEffect(() => {
    if (!activePendingResearchId) {
      setHasShownPendingError(false);
      return;
    }

    if (pendingStatus && hasShownPendingError) {
      setHasShownPendingError(false);
    }
  }, [activePendingResearchId, hasShownPendingError, pendingStatus]);

  useEffect(() => {
    if (!activePendingResearchId || !pendingStatusError) {
      return;
    }

    if (hasShownPendingError) {
      return;
    }

    setHasShownPendingError(true);
    toast.error('Не удалось дождаться завершения исследования. Попробуйте открыть его позже.');
  }, [activePendingResearchId, hasShownPendingError, pendingStatusError]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    try {
      await deleteResearch(pendingDelete.id);
      toast.success('Исследование удалено');
    } catch {
      toast.error('Не удалось удалить исследование');
    }
    setPendingDelete(null);
  };

  return (
    <section className="saved-page">
      <header className="saved-page__header">
        <div className="saved-page__intro">
          <h1 className="saved-page__title t-h-40">Сохраненные исследования</h1>
          <p className="saved-page__subtitle t-common-big">
            Здесь вы можете увидеть все сохраненные анализы ваших проектов
          </p>
        </div>
        <Button className="saved-page__add" onClick={() => navigate('/load')}>
          <Plus size={20} strokeWidth={2.5} />
          Добавить
        </Button>
      </header>

      <div className="saved-page__grid-viewport">
        {isLoading ? (
          pendingFallbackProject ? (
            <div className="saved-page__grid">
              <ProjectCard project={pendingFallbackProject} onDelete={setPendingDelete} />
            </div>
          ) : isRouteLoading ? null : (
            <Loader block />
          )
        ) : projects.length === 0 && pendingFallbackProject ? (
          <div className="saved-page__grid">
            <ProjectCard project={pendingFallbackProject} onDelete={setPendingDelete} />
          </div>
        ) : projects.length === 0 ? (
          <p className="saved-page__empty">Пока нет сохраненных исследований</p>
        ) : (
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="saved-page__grid"
            >
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={setPendingDelete} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />

      <DeleteConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};
