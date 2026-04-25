import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useDeleteResearch,
  useResearchList,
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
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);
  const { data: projects = [], isLoading } = useResearchList();
  const { mutateAsync: deleteResearch } = useDeleteResearch();

  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SavedResearchListItem | null>(null);

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
        <Button className="saved-page__add" onClick={() => navigate('/research/demo-latest')}>
          <Plus size={20} strokeWidth={2.5} />
          Добавить
        </Button>
      </header>

      <div className="saved-page__grid-viewport">
        {isLoading ? (
          isRouteLoading ? null : (
            <Loader block />
          )
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
