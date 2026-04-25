import { BookOpenText, FolderKanban, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useArticles } from '@/entities/article';
import {
  useDeleteResearch,
  useResearchList,
  type SavedResearchListItem,
} from '@/entities/research';
import { ProjectCard } from '@/pages/SavedPage/ui/ProjectCard';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal/ui';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';

import './dashboard-page.scss';

const sortByCreatedAt = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

export const DashboardPage = () => {
  const navigate = useNavigate();
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);
  const { data: researches = [], isLoading: researchesLoading } = useResearchList();
  const { data: articles = [], isLoading: articlesLoading } = useArticles();
  const { mutateAsync: deleteResearch } = useDeleteResearch();
  const [pendingDelete, setPendingDelete] = useState<SavedResearchListItem | null>(null);

  const recentResearches = sortByCreatedAt(researches).slice(0, 3);
  const featuredArticles = articles.slice(0, 4);

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
    <section className="dashboard-page">
      <header className="dashboard-page__hero">
        <div className="dashboard-page__hero-copy">
          <p className="dashboard-page__eyebrow">Личный кабинет</p>
          <h1 className="dashboard-page__title t-h-40">
            Продолжайте работу над исследованиями без лишних кликов
          </h1>
          <p className="dashboard-page__lead t-common-big">
            Здесь собраны последние сохранённые анализы, быстрые переходы и полезные статьи из
            раздела помощи.
          </p>
        </div>

        <div className="dashboard-page__quick-actions">
          <button
            type="button"
            className="dashboard-page__quick-action dashboard-page__quick-action--primary"
            onClick={() => navigate('/research/demo-latest')}
          >
            <PlusCircle size={20} strokeWidth={2.25} />
            <span>Новое исследование</span>
          </button>
          <Link to="/saved" className="dashboard-page__quick-action">
            <FolderKanban size={20} strokeWidth={2.25} />
            <span>Сохраненные исследования</span>
          </Link>
          <Link to="/articles" className="dashboard-page__quick-action">
            <BookOpenText size={20} strokeWidth={2.25} />
            <span>Раздел помощи</span>
          </Link>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2 className="dashboard-section__title t-h-40">Недавние исследования</h2>
          <p className="dashboard-section__text t-common-big">
            Продолжите просмотр сохраненных исследований и вернитесь к последним результатам.
          </p>
        </div>

        {researchesLoading ? (
          isRouteLoading ? null : (
            <Loader block />
          )
        ) : recentResearches.length === 0 ? (
          <div className="dashboard-page__empty">Сохранённых исследований пока нет.</div>
        ) : (
          <div className="dashboard-page__research-grid">
            {recentResearches.map((research) => (
              <ProjectCard key={research.id} project={research} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2 className="dashboard-section__title t-h-40">Часто возникаемые вопросы</h2>
          <p className="dashboard-section__text t-common-big">
            Короткие ответы на самые частые вопросы по загрузке проектов, сохранению и чтению
            отчётов.
          </p>
        </div>

        {articlesLoading ? (
          isRouteLoading ? null : (
            <Loader block />
          )
        ) : (
          <div className="dashboard-page__article-grid">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="dashboard-article-card"
              >
                <div className="dashboard-article-card__preview">
                  <img src={article.coverImage} alt="" loading="lazy" />
                </div>
                <div className="dashboard-article-card__body">
                  <h3 className="dashboard-article-card__title">{article.title}</h3>
                  <p className="dashboard-article-card__excerpt">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

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
