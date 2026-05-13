import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useArticle } from '@/entities/article';
import { renderMarkdown } from '@/shared/lib/markdown/render-markdown';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';

import './article-page.scss';

export const ArticlePage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const isRouteLoading = useRouteLoaderStore((state) => state.isRouteLoading);
  const { data: article, isLoading } = useArticle(articleId);

  if (isLoading) {
    return <section className="article-page">{isRouteLoading ? null : <Loader block />}</section>;
  }

  if (!article) {
    return (
      <section className="article-page">
        <div className="article-page__empty">Статья не найдена.</div>
      </section>
    );
  }

  return (
    <article className="article-page">
      <Link to="/articles" className="article-page__back">
        <ArrowLeft size={18} strokeWidth={2} />
        Ко всем статьям
      </Link>

      <header className="article-page__header">
        <div className="article-page__hero">
          <p className="article-page__eyebrow">FAQ / ASTeroid</p>
          <h1 className="article-page__title t-h-40">{article.title}</h1>
          <p className="article-page__excerpt t-common-big">{article.excerpt}</p>
        </div>
      </header>

      <div
        className="article-page__content markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
      />
    </article>
  );
};
