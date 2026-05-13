import { Link } from 'react-router-dom';

import { useArticles } from '@/entities/article';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';

import './articles-page.scss';

export const ArticlesPage = () => {
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);
  const { data: articles = [], isLoading } = useArticles();

  return (
    <section className="articles-page">
      <header className="articles-page__header">
        <h1 className="articles-page__title t-h-40">Раздел помощи</h1>
        <p className="articles-page__lead t-common-big">
          В этом разделе собраны ответы на самые частые вопросы по загрузке проектов, просмотру
          результатов и сохранению исследований.
        </p>
      </header>

      {isLoading ? (
        isRouteLoading ? null : (
          <Loader block />
        )
      ) : (
        <div className="articles-page__grid">
          {articles.map((article) => (
            <Link key={article.id} to={`/articles/${article.id}`} className="article-card">
              <div className="article-card__preview">
                <img src={article.coverImage} alt="" loading="lazy" />
              </div>
              <div className="article-card__body">
                <h2 className="article-card__title">{article.title}</h2>
                <p className="article-card__excerpt">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
